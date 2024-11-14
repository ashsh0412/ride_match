import { useState, useEffect } from "react";
import { reverseGeocode } from "../api/Geocoding";
import { getEndCoordinates, getStartCoordinates } from "./RouteMap";

export interface PassengerDetail {
  name: string;
  pickup: string;
  time: string;
}

export interface LocationData {
  origin: string;
  destination: string;
  waypoints: {
    location: string;
    stopover: boolean;
  }[];
  labels: {
    origin: string;
    destination: string;
    passengers: {
      name: string;
      scheduledTime: string;
      pickup: string;
    }[];
  };
}

export interface PickupTime {
  location: string;
  time: string;
}

export const useRouteData = (passengerDetails: PassengerDetail[]) => {
  const [startPoint, setStartPoint] = useState<string>("");
  const [endPoint, setEndPoint] = useState<string>("");
  const [locationData, setLocationData] = useState<LocationData>({
    origin: "",
    destination: "",
    waypoints: [],
    labels: {
      origin: "",
      destination: "",
      passengers: [],
    },
  });

  // Get coordinates once when the hook is initialized
  const startCoordinates = getStartCoordinates();
  const endCoordinates = getEndCoordinates();

  // First useEffect to fetch addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        if (startCoordinates && endCoordinates) {
          const [start, end] = await Promise.all([
            reverseGeocode(startCoordinates.lat, startCoordinates.lng),
            reverseGeocode(endCoordinates.lat, endCoordinates.lng),
          ]);

          setStartPoint(start);
          setEndPoint(end);
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
        setStartPoint(
          startCoordinates
            ? `${startCoordinates.lat}, ${startCoordinates.lng}`
            : ""
        );
        setEndPoint(
          endCoordinates ? `${endCoordinates.lat}, ${endCoordinates.lng}` : ""
        );
      }
    };

    if (startCoordinates && endCoordinates) {
      fetchAddresses();
    }
  }, [startCoordinates, endCoordinates]);

  // Second useEffect to update locationData
  useEffect(() => {
    if (!startPoint || !endPoint) return;

    const newLocationData: LocationData = {
      origin: startCoordinates
        ? `${startCoordinates.lat},${startCoordinates.lng}`
        : "",
      destination: endCoordinates
        ? `${endCoordinates.lat},${endCoordinates.lng}`
        : "",
      waypoints:
        passengerDetails?.map((passenger) => ({
          location: passenger.pickup,
          stopover: true,
        })) || [],
      labels: {
        origin: startPoint,
        destination: endPoint,
        passengers:
          passengerDetails?.map((p) => ({
            name: p.name,
            scheduledTime: new Date(p.time).toLocaleString(),
            pickup: p.pickup,
          })) || [],
      },
    };

    setLocationData(newLocationData);
  }, [startPoint, endPoint, passengerDetails]); // Remove coordinates from dependencies

  const calculatePickupTimes = (
    legs: google.maps.DirectionsLeg[]
  ): PickupTime[] => {
    const selectedDate = sessionStorage.getItem("selectedDate");
    let currentTime = selectedDate ? new Date(selectedDate) : new Date();

    const pickupTimes: PickupTime[] = [];
    const a = localStorage.getItem("selectedPassengerDetails");

    // localStorage에서 승객 데이터 가져오기
    const passengers: PassengerDetail[] = a ? JSON.parse(a) : [];

    let cumulativeDuration = 0;

    try {
      for (let i = 0; i < legs.length - 1; i++) {
        const durationValue = Number(legs[i]?.duration?.value ?? 0);
        const passengerTime = passengers[i]?.time;

        if (isNaN(durationValue) || durationValue === 0) {
          console.warn(`Invalid or missing duration value for leg ${i}`);
          continue;
        }

        // 이동 시간을 누적하여 예상 도착 시간 계산
        cumulativeDuration += durationValue;
        const arrivalTime = new Date(
          currentTime.getTime() + cumulativeDuration * 1000
        );

        // 승객의 예약 시간과 비교하여 대기 시간 계산
        const stopTime =
          passengerTime && new Date(passengerTime) > arrivalTime
            ? new Date(passengerTime).getTime() - arrivalTime.getTime()
            : 0;

        // 도착 시간에 대기 시간 반영
        const adjustedPickupTime = new Date(arrivalTime.getTime() + stopTime);

        // 날짜와 시간 모두 추가
        pickupTimes.push({
          location: legs[i]?.end_address || "",
          time: adjustedPickupTime.toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
        });

        // 누적 시간에 대기 시간 추가 (초 단위)
        cumulativeDuration += stopTime / 1000;
      }
    } catch (error) {
      console.error("Error calculating pickup times:", error);
    }

    return pickupTimes;
  };

  return {
    startPoint,
    endPoint,
    locationData,
    calculatePickupTimes,
  };
};