import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    console.log('Starting seed...')

    try {
        await prisma.$transaction(async (tx) => {
            // Seed admin user with upsert
            const hashedAdminPassword = await bcrypt.hash('admin123', 10)
            const admin = await tx.user.upsert({
                where: { email: 'admin@admin.com' },
                update: {}, // Don't update if exists
                create: {
                    fullname: 'admin',
                    email: 'admin@admin.com',
                    password: hashedAdminPassword,
                },
            })
            
            console.log(`Admin user: ${admin.email} ${admin.id ? '(existing)' : '(created)'}`)
        })

        console.log('Seed completed successfully!')
    } catch (error) {
        console.error('Seed failed:', error)
        throw error
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
