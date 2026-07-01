output "instance_public_ip" {
  description = "The public IP address of the EC2 instance."
  value       = aws_instance.quantumshop.public_ip
}

output "instance_public_dns" {
  description = "The public DNS name of the EC2 instance."
  value       = aws_instance.quantumshop.public_dns
}

output "app_url" {
  description = "The URL to access the QuantumShop web application."
  value       = "http://${aws_instance.quantumshop.public_ip}"
}

output "grafana_url" {
  description = "The URL to access the Grafana dashboard."
  value       = "http://${aws_instance.quantumshop.public_ip}:3001"
}
