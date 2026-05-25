package com.zeiss.pilot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class PilotApplication {

	public static void main(String[] args) {
		SpringApplication.run(PilotApplication.class, args);
	}

}
