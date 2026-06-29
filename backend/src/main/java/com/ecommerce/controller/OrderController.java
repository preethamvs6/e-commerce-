package com.ecommerce.controller;

import com.ecommerce.dto.OrderDto;
import com.ecommerce.dto.OrderRequest;
import com.ecommerce.security.UserPrincipal;
import com.ecommerce.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Order Module", description = "Endpoints for checking out shopping carts, tracking orders, and viewing purchase logs.")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    @Operation(summary = "Place a new order (Checkout)")
    public ResponseEntity<OrderDto> placeOrder(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                               @Valid @RequestBody OrderRequest orderRequest) {
        OrderDto order = orderService.placeOrder(userPrincipal.getId(), orderRequest.getShippingAddress(), orderRequest.getPaymentMethod());
        return ResponseEntity.ok(order);
    }

    @GetMapping
    @Operation(summary = "Get current user's order history")
    public ResponseEntity<List<OrderDto>> getMyOrders(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<OrderDto> orders = orderService.getUserOrders(userPrincipal.getId());
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed order by ID")
    public ResponseEntity<OrderDto> getOrderById(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                                 @PathVariable Long id) {
        OrderDto order = orderService.getOrderById(id, userPrincipal.getId(), userPrincipal.getAuthorities().iterator().next().getAuthority());
        return ResponseEntity.ok(order);
    }
}
