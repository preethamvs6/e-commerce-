package com.ecommerce.controller;

import com.ecommerce.dto.ProductDto;
import com.ecommerce.security.UserPrincipal;
import com.ecommerce.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@Tag(name = "Wishlist Module", description = "Endpoints for managing user favorite products (wishlist).")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @GetMapping
    @Operation(summary = "Get current user's wishlist items")
    public ResponseEntity<List<ProductDto>> getWishlist(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<ProductDto> wishlist = wishlistService.getUserWishlist(userPrincipal.getId());
        return ResponseEntity.ok(wishlist);
    }

    @PostMapping("/{productId}")
    @Operation(summary = "Add a product to wishlist")
    public ResponseEntity<Void> addToWishlist(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                              @PathVariable Long productId) {
        wishlistService.addToWishlist(userPrincipal.getId(), productId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{productId}")
    @Operation(summary = "Remove a product from wishlist")
    public ResponseEntity<Void> removeFromWishlist(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                                   @PathVariable Long productId) {
        wishlistService.removeFromWishlist(userPrincipal.getId(), productId);
        return ResponseEntity.ok().build();
    }
}
