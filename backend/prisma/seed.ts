import { PrismaClient, Role, TransactionStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('admin123', 10);

    // 1. Create Admin User
    const admin = await prisma.user.upsert({
        where: { email: 'admin@outloop.com' },
        update: {},
        create: {
            email: 'admin@outloop.com',
            password,
            role: Role.ADMIN,
        },
    });

    // 2. Create Departments
    const itDept = await prisma.department.upsert({
        where: { name: 'IT' },
        update: {},
        create: { name: 'IT' },
    });

    const hrDept = await prisma.department.upsert({
        where: { name: 'HR' },
        update: {},
        create: { name: 'HR' },
    });

    // 3. Create Vendors
    const dell = await prisma.vendor.create({
        data: {
            name: 'Dell Technologies',
            address: 'One Dell Way, Round Rock, TX',
            email: 'sales@dell.com',
        },
    });

    const staples = await prisma.vendor.create({
        data: {
            name: 'Staples',
            address: '500 Staples Dr, Framingham, MA',
            email: 'support@staples.com',
        },
    });

    // 4. Create Items
    const laptop = await prisma.item.create({
        data: {
            name: 'Dell Latitude 5420',
            description: 'Business laptop 16GB RAM',
        },
    });

    const monitor = await prisma.item.create({
        data: {
            name: 'Dell 27" Monitor',
            description: '4K Workspace monitor',
        },
    });

    const paper = await prisma.item.create({
        data: {
            name: 'A4 Paper Bundle',
            description: 'White printer paper',
        },
    });

    // 5. Create Transactions
    // Consumable (Auto-completed)
    await prisma.transaction.create({
        data: {
            isReturnable: false,
            status: TransactionStatus.COMPLETED,
            remarks: 'Monthly office supplies',
            vendorId: staples.id,
            departmentId: hrDept.id,
            createdById: admin.id,
            items: {
                create: [
                    { itemId: paper.id }
                ]
            }
        },
    });

    // Returnable (Active)
    await prisma.transaction.create({
        data: {
            isReturnable: true,
            status: TransactionStatus.ACTIVE,
            remarks: 'Laptop allocation for new joiner',
            vendorId: dell.id,
            departmentId: itDept.id,
            createdById: admin.id,
            expectedReturnDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            items: {
                create: [
                    { itemId: laptop.id },
                    { itemId: monitor.id }
                ]
            }
        },
    });

    console.log('Seed data created successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
