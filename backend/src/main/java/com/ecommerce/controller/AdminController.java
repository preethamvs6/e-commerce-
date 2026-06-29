package com.ecommerce.controller;

import com.ecommerce.dto.AuthResponse;
import com.ecommerce.dto.DashboardAnalyticsDto;
import com.ecommerce.dto.OrderDto;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.service.AdminService;
import com.ecommerce.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin Module", description = "Endpoints for administrator operations including store analytics, updating order statuses, and listing users.")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/analytics")
    @Operation(summary = "Get admin dashboard KPI metrics and analytics")
    public ResponseEntity<DashboardAnalyticsDto> getAnalytics() {
        return ResponseEntity.ok(adminService.getDashboardAnalytics());
    }

    @GetMapping("/orders")
    @Operation(summary = "Get list of all orders in the store")
    public ResponseEntity<List<OrderDto>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/orders/{id}/status")
    @Operation(summary = "Update an order's status (e.g. SHIPPED, DELIVERED)")
    public ResponseEntity<OrderDto> updateOrderStatus(@PathVariable Long id, @RequestParam("status") String status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    @GetMapping("/users")
    @Operation(summary = "Get list of all registered users in the platform")
    public ResponseEntity<List<AuthResponse>> getAllUsers() {
        List<AuthResponse> users = userRepository.findAll().stream()
                .map(user -> AuthResponse.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .address(user.getAddress())
                        .phone(user.getPhone())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }
}
