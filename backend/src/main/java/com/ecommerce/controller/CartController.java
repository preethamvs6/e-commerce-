package com.ecommerce.controller;

import com.ecommerce.dto.CartItemDto;
import com.ecommerce.dto.CartRequest;
import com.ecommerce.security.UserPrincipal;
import com.ecommerce.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
@Tag(name = "Cart Module", description = "Endpoints for managing the active user's shopping cart items.")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    @Operation(summary = "Get the active user's shopping cart items")
    public ResponseEntity<List<CartItemDto>> getCart(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(cartService.getUserCart(userPrincipal.getId()));
    }

    @PostMapping
    @Operation(summary = "Add an item to the shopping cart")
    public ResponseEntity<CartItemDto> addItem(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                               @Valid @RequestBody CartRequest cartRequest) {
        CartItemDto item = cartService.addItemToCart(userPrincipal.getId(), cartRequest.getProductId(), cartRequest.getQuantity());
        return ResponseEntity.ok(item);
    }

    @PutMapping("/{productId}")
    @Operation(summary = "Update an item quantity in the cart")
    public ResponseEntity<CartItemDto> updateItemQuantity(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                                          @PathVariable Long productId,
                                                          @RequestParam("quantity") Integer quantity) {
        CartItemDto item = cartService.updateItemQuantity(userPrincipal.getId(), productId, quantity);
        return ResponseEntity.ok(item);
    }

    @DeleteMapping("/{productId}")
    @Operation(summary = "Remove an item from the cart")
    public ResponseEntity<Void> removeItem(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                           @PathVariable Long productId) {
        cartService.removeItemFromCart(userPrincipal.getId(), productId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    @Operation(summary = "Clear all items from the shopping cart")
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        cartService.clearCart(userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }
}
