import { Injectable, NotFoundException, ConflictException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { paginate, PaginatedResponse } from '../common/paginate';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService implements OnModuleInit {
  constructor(@InjectRepository(Customer) private readonly repo: Repository<Customer>) {}

  async onModuleInit(): Promise<void> {
    if (await this.repo.count() > 0) return;
    await this.repo.save([
      this.repo.create({ firstName: 'Priya', lastName: 'Sharma', email: 'priya.sharma@gmail.com', phone: '9811000001', country: 'India', status: 'Active' }),
      this.repo.create({ firstName: 'Rahul', lastName: 'Verma', email: 'rahul.verma@outlook.com', phone: '9811000002', country: 'India', status: 'Active' }),
      this.repo.create({ firstName: 'Anita', lastName: 'Kapoor', email: 'anita.kapoor@yahoo.com', phone: '9811000003', country: 'UAE', status: 'Inactive' }),
      this.repo.create({ firstName: 'John', lastName: 'Doe', email: 'john.doe@email.com', phone: '9811000004', country: 'USA', status: 'Blocked' }),
    ]);
  }

  async findAll(page = 1, limit = 50): Promise<PaginatedResponse<Customer>> {
    return paginate<Customer>(this.repo, page, limit, { order: { registeredAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Customer> {
    const c = await this.repo.findOneBy({ id });
    if (!c) throw new NotFoundException(`Customer ${id} not found`);
    return c;
  }

  async create(dto: CreateCustomerDto): Promise<Customer> {
    const taken = await this.repo.findOneBy({ email: dto.email.toLowerCase() });
    if (taken) throw new ConflictException(`Email '${dto.email}' already in use`);
    return this.repo.save(this.repo.create({ ...dto, email: dto.email.toLowerCase(), status: dto.status ?? 'Active' }));
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const c = await this.findOne(id);
    return this.repo.save({ ...c, ...dto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }

  async bulkRemove(ids: string[]): Promise<void> {
    await this.repo.delete({ id: In(ids) });
  }
}
