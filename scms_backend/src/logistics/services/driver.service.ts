// driver.service.ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from '../entities/driver.entity';
import { Transport } from '../entities/transport.entity';
import { CreateDriverDto, DriverLoginDto } from '../DTOs/driver.dto';
@Injectable()
export class DriverService {
  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    @InjectRepository(Transport)
    private readonly transportRepository: Repository<Transport>,
  ) {}

  async findAll(): Promise<Driver[]> {
    return this.driverRepository.find();
  }

  async findById(id: number): Promise<Driver> {
    return this.driverRepository.findOne({
      where: { id: id },
    });
  }

  // Find driver by name
  async findByName(name: string, caseSensitive = false): Promise<Driver> {
    if (caseSensitive) {
      return this.driverRepository.findOne({
        where: { name: name },
      });
    } else {
      return this.driverRepository
        .createQueryBuilder('driver')
        .where('LOWER(driver.name) = LOWER(:name)', { name: name })
        .getOne();
    }
  }

  // Find driver by email
  async findByEmail(email: string, caseSensitive = false): Promise<Driver> {
    if (caseSensitive) {
      return this.driverRepository.findOne({
        where: { email: email },
      });
    } else {
      return this.driverRepository
        .createQueryBuilder('driver')
        .where('LOWER(driver.email) = LOWER(:email)', { email: email })
        .getOne();
    }
  }

  async create(createDriverDto: CreateDriverDto): Promise<Driver> {
    return this.driverRepository.save(createDriverDto);
  }

  async remove(id: number): Promise<void> {
    const result = await this.driverRepository.delete(id);
    if (result.affected === 0) {
      throw new HttpException('Driver not found', HttpStatus.NOT_FOUND);
    }
  }

  // Update Driver
  async update(
    id: number,
    updatedDriverData: CreateDriverDto,
  ): Promise<Driver> {
    const existingDriver = await this.driverRepository.findOne({
      where: { id: id },
    });

    if (!existingDriver) {
      throw new HttpException('Driver not found', HttpStatus.NOT_FOUND);
    }

    // Update only the fields that are provided in updatedDriverData
    if (updatedDriverData.name) {
      existingDriver.name = updatedDriverData.name;
    }
    if (updatedDriverData.contactNumber) {
      existingDriver.contactNumber = updatedDriverData.contactNumber;
    }
    if (updatedDriverData.licenseNumber) {
      existingDriver.licenseNumber = updatedDriverData.licenseNumber;
    }
    if (updatedDriverData.availability !== undefined) {
      existingDriver.availability = updatedDriverData.availability;
    }
    if (updatedDriverData.address) {
      existingDriver.address = updatedDriverData.address;
    }
    if (updatedDriverData.email) {
      existingDriver.email = updatedDriverData.email;
    }
    if (updatedDriverData.password) {
      existingDriver.password = updatedDriverData.password;
    }
    if (updatedDriverData.vehicleId !== undefined) {
      existingDriver.vehicleId = updatedDriverData.vehicleId;
    }
    if (updatedDriverData.notes) {
      existingDriver.notes = updatedDriverData.notes;
    }
    if (updatedDriverData.photo) {
      existingDriver.photo = updatedDriverData.photo;
    }

    // Save the updated driver
    const updatedDriver = await this.driverRepository.save(existingDriver);

    return updatedDriver;
  }

  // Get assigned transports for a driver
  async getAssignedTransports(id: number): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: { id: id },
      relations: ['transports'],
    });

    if (!driver) {
      throw new HttpException('Driver not found', HttpStatus.NOT_FOUND);
    }

    if (driver.transports.length === 0) {
      throw new HttpException(
        'No transports are assigned to this driver',
        HttpStatus.NOT_FOUND,
      );
    }

    return driver;
  }

  // Assign a transport to a driver
  async assignTransport(
    driverId: number,
    transportId: number,
  ): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: { id: driverId },
      relations: ['transports'],
    });

    if (!driver) {
      throw new HttpException('Driver not found', HttpStatus.NOT_FOUND);
    }

    const transport = await this.transportRepository.findOne({
      where: { id: transportId },
    });

    if (!transport) {
      throw new HttpException('Transport not found', HttpStatus.NOT_FOUND);
    }

    driver.transports.push(transport);
    await this.driverRepository.save(driver);

    return driver;
  }

  // Unassign a transport from a driver
  async unassignTransport(
    driverId: number,
    transportId: number,
  ): Promise<Driver> {
    const driver = await this.driverRepository.findOne({
      where: { id: driverId },
      relations: ['transports'],
    });

    if (!driver) {
      throw new HttpException('Driver not found', HttpStatus.NOT_FOUND);
    }

    const transport = await this.transportRepository.findOne({
      where: { id: transportId },
    });

    if (!transport) {
      throw new HttpException('Transport not found', HttpStatus.NOT_FOUND);
    }

    driver.transports = driver.transports.filter(
      (transport) => transport.id !== transportId,
    );
    await this.driverRepository.save(driver);

    return driver;
  }

  // ------------------- Login -------------------

  // Login
  async login(driverLoginDto: DriverLoginDto) {
    const driver = await this.driverRepository.findOne({
      where: { email: driverLoginDto.email },
    });

    if (!driver) {
      throw new HttpException('Driver not found', HttpStatus.NOT_FOUND);
    } else {
      const isPasswordMatching =
        driverLoginDto.password === driver.password ? true : false;

      if (isPasswordMatching) return true;
      else return false;
    }
  }

  // ------------------- End of Login -------------------
}
