package com.paradiseresort.backend.controller;

import com.paradiseresort.backend.dto.GuestResponse;
import com.paradiseresort.backend.service.GuestService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/guests")
public class AdminGuestController {

    private final GuestService guestService;

    public AdminGuestController(GuestService guestService) {
        this.guestService = guestService;
    }

    @GetMapping("/search")
    public ResponseEntity<GuestResponse> getGuest(
            @RequestParam String email
    ) {
        return ResponseEntity.ok(
                guestService.getGuestByEmail(email)
        );
    }
}