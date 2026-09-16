package com.paradiseresort.backend.config;

import com.paradiseresort.backend.entity.Room;
import com.paradiseresort.backend.repository.RoomRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;


@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeRooms(
            RoomRepository roomRepository
    ) {

        return args -> {

            if (roomRepository.count() == 0) {

                roomRepository.save(
                        new Room(
                                "Deluxe Room",
                                "A comfortable room designed for a relaxing stay.",
                                new BigDecimal("4999.00"),
                                2,
                                "deluxe.jpg"
                        )
                );


                roomRepository.save(
                        new Room(
                                "Premium Suite",
                                "Spacious accommodation with an elevated experience.",
                                new BigDecimal("7999.00"),
                                3,
                                "suite.jpg"
                        )
                );


                roomRepository.save(
                        new Room(
                                "Family Villa",
                                "A spacious stay designed for families and groups.",
                                new BigDecimal("10999.00"),
                                6,
                                "villa.jpg"
                        )
                );
            }
        };
    }
}