package com.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardAnalyticsDto {
    private BigDecimal totalSales;
    private Long totalOrders;
    private Long totalUsers;
    private Long totalProducts;
    private List<OrderDto> recentOrders;
}
