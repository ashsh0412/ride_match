// RideRequestForm.tsx
import React, { useState } from "react";
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaMapMarkerAlt, FaMapPin } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css"; // CSS 파일도 필요합니다.
import CustomDatePicker from "./DatePicker";

const RideRequestForm: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const inputBg = useColorModeValue("gray.100", "gray.700");
  const inputHoverBg = useColorModeValue("gray.200", "gray.600");
  const iconColor = useColorModeValue("gray.500", "gray.400");
  console.log(startDate);

  return (
    <>
      <Text fontSize="xl" fontWeight="bold" mb={2}>
        Request a Ride
      </Text>
      <Box position="relative">
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <FaMapMarkerAlt color={iconColor} />
          </InputLeftElement>
          <Input
            id="pickup-location"
            placeholder="Pickup Location"
            size="lg"
            bg={inputBg}
            border="none"
            pl="40px"
            _hover={{ bg: inputHoverBg }}
            _focus={{ bg: inputHoverBg, boxShadow: "none" }}
          />
        </InputGroup>
      </Box>
      <Box position="relative">
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <FaMapPin color={iconColor} />
          </InputLeftElement>
          <Input
            id="dropoff-location"
            placeholder="Destination"
            size="lg"
            bg={inputBg}
            border="none"
            pl="40px"
            _hover={{ bg: inputHoverBg }}
            _focus={{ bg: inputHoverBg, boxShadow: "none" }}
          />
        </InputGroup>
      </Box>

      <CustomDatePicker
        onChange={(date) => setStartDate(date)}
        iconColor={iconColor}
        inputBg={inputBg}
        inputHoverBg={inputHoverBg}
      />

      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        h="50px"
        w="100%"
        bg={inputBg}
        _hover={{ bg: inputHoverBg }}
        cursor="pointer"
        borderRadius="0.375rem" // 여기서 border radius 설정
        fontWeight="medium" // 글자 두께 설정
        fontSize="lg" // 글자 크기 설정
      >
        Find Drivers
      </Box>
    </>
  );
};

export default RideRequestForm;