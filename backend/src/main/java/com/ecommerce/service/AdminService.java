package com.ecommerce.service;

import com.ecommerce.dto.DashboardAnalyticsDto;
import com.ecommerce.dto.OrderDto;
import com.ecommerce.dto.OrderItemDto;
import com.ecommerce.model.Order;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    public DashboardAnalyticsDto getDashboardAnalytics() {
        List<Order> allOrders = orderRepository.findAll();
        
        // Compute total sales (exclude cancelled orders)
        BigDecimal totalSales = allOrders.stream()
                .filter(order -> !order.getStatus().equalsIgnoreCase("CANCELLED"))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = allOrders.size();
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();

        // Get top 5 recent orders
        List<OrderDto> recentOrders = orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .limit(5)
                .map(this::convertOrderToDto)
                .collect(Collectors.toList());

        return DashboardAnalyticsDto.builder()
                .totalSales(totalSales)
                .totalOrders(totalOrders)
                .totalUsers(totalUsers)
                .totalProducts(totalProducts)
                .recentOrders(recentOrders)
                .build();
    }

    private OrderDto convertOrderToDto(Order order) {
        List<OrderItemDto> items = order.getOrderItems().stream()
                .map(item -> OrderItemDto.builder()
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .productImageUrl(item.getProduct().getImageUrl())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .build())
                .collect(Collectors.toList());

        return OrderDto.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .userName(order.getUser().getName())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .shippingAddress(order.getShippingAddress())
                .paymentMethod(order.getPaymentMethod())
                .createdAt(order.getCreatedAt())
                .items(items)
                .build();
    }
}
