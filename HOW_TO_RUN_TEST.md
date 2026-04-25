# Snapify - Mobile App

[![Test Workflow](https://github.com/ttkien2004/snapify-frontend-v1/actions/workflows/test.yml/badge.svg)](https://github.com/ttkien2004/snapify-frontend-v1/actions/workflows/test.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=L01-12345_snapify-frontend-v1&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=L01-12345_snapify-frontend-v1)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=L01-12345_snapify-frontend-v1&metric=coverage)](https://sonarcloud.io/summary/new_code?id=L01-12345_snapify-frontend-v1)

## Hướng dẫn chạy Unit Test Locally

Dự án sử dụng Jest và React Native Testing Library để thực hiện kiểm thử.

**1. Cài đặt thư viện (nếu chưa có):**

```bash
npm install
```

**2. Chạy toàn bộ Test Cases:**

```bash
npm run test
```

**3. Chạy Test và xem tỷ lệ Coverage (Bao phủ mã):**

```bash
npm run test:coverage
```

_Sau khi chạy xong, bạn có thể mở file `coverage/lcov-report/index.html` trên
trình duyệt để xem giao diện Report chi tiết._
