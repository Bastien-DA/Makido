import { OrdersService } from '../domain/services/orders.service.js';
import { DownstreamService } from '../domain/services/downstream.service.js';

export const ordersProviders = [OrdersService, DownstreamService];
