import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from '../entities/shipment.entity';
import { CreateShipmentDto } from '../DTOs/shipment.dto';
import { Driver } from '../entities/driver.entity';
import { Transport } from '../entities/transport.entity';

@Injectable()
export class ShipmentService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,
  ) {}

  async createShipment(
    createShipmentDto: CreateShipmentDto,
  ): Promise<Shipment> {
    const shipment = this.shipmentRepository.create(createShipmentDto);
    return this.shipmentRepository.save(shipment);
  }

  async findAllShipments(): Promise<Shipment[]> {
    return this.shipmentRepository.find();
  }

  async findShipmentById(id: number): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id },
    });
    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }
    return shipment;
  }

  async updateShipment(
    id: number,
    updateShipmentDto: CreateShipmentDto,
  ): Promise<Shipment> {
    const existingShipment = await this.findShipmentById(id);
    this.shipmentRepository.merge(existingShipment, updateShipmentDto);
    return this.shipmentRepository.save(existingShipment);
  }

  async deleteShipment(id: number): Promise<void> {
    const shipment = await this.findShipmentById(id);
    await this.shipmentRepository.remove(shipment);
  }

  async getShipmentsForDriver(id: number): Promise<Shipment[]> {
    const shipments = await this.shipmentRepository.find({
      where: { driver: { id: id } },
    });
    return shipments;
  }

  // Get driver details for shipment
  async getDriverForShipment(id: number): Promise<Driver> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: id },
      relations: ['driver'],
    });
    return shipment.driver;
  }

  // Get transport details for shipment
  async getTransportForShipment(id: number): Promise<Transport> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: id },
      relations: ['transport'],
    });
    return shipment.transport;
  }

  // Return all shipments for a transport
  async getShipmentsForTransport(id: number): Promise<Shipment[]> {
    const shipments = await this.shipmentRepository.find({
      where: { transport: { id: id } },
    });
    return shipments;
  }
}
