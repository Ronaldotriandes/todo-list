
export interface QueryParams {
    page?: number | string;
    perpage?: number | string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    [key: string]: any;
}

export async function QueryGetAll<T>(
    model: any, // Prisma model (ex: prisma.user)
    quer: QueryParams = {}, // dari req.query
    searchFields: string[] = [], // untuk LIKE
    options: {
        select?: any;   // Prisma select object
        include?: any;  // Prisma include object
    } = {},
) {
    const page = quer && quer.page ? parseInt(String(quer.page), 10) : 1;
    const perPage = quer && quer.perpage ? parseInt(String(quer.perpage), 10) : 10;
    // === WHERE ===
    const where: any = {};

    // 1. LIKE (search)
    if (quer && quer.search && searchFields.length > 0) {
        where.OR = searchFields.map((field) => ({
            [field]: { contains: quer.search, mode: 'insensitive' },
        }));
    }

    // 2. Boolean
    Object.keys(quer).forEach((key) => {
        if (key.startsWith('wherebool-')) {
            const field = key.replace('wherebool-', '');
            where[field] = quer[key] === 'true' || quer[key] === '1';
        }
    });

    // 3. IN
    Object.keys(quer).forEach((key) => {
        if (key.startsWith('wherein-')) {
            const field = key.replace('wherein-', '');
            where[field] = { in: Array.isArray(quer[key]) ? quer[key] : [quer[key]] };
        }
    });

    // 4. BETWEEN (dates)
    Object.keys(quer).forEach((key) => {
        if (key.startsWith('wherebetween-')) {
            const field = key.replace('wherebetween-', '');
            const [start, end] = String(quer[key]).split('|');
            where[field] = {
                gte: new Date(start),
                lte: new Date(end),
            };
        }
    });

    // 5. Default equality
    Object.keys(quer).forEach((key) => {
        if (key.startsWith('where-')) {
            const field = key.replace('where-', '');
            const value = quer[key];
            if (field.includes('.')) {
                const parts = field.split('.');
                let nested: any = {};
                let current = nested;

                parts.forEach((p, idx) => {
                    if (idx === parts.length - 1) {
                        current[p] = { contains: value, mode: 'insensitive' };
                    } else {
                        current[p] = {};
                        current = current[p];
                    }
                });

                Object.assign(where, nested);
            } else {
                where[field] = value;
            }
        }
    });

    // === SORT ===
    const orderBy: any = {};
    if (quer.sortBy) {
        orderBy[quer.sortBy] = quer.sortOrder || 'desc';
    } else {
        orderBy['createdAt'] = 'desc';
    }

    const queryOptions: any = {
        where,
        orderBy,
        skip: (page - 1) * perPage,
        take: perPage,
    };


    if (options.select) {
        queryOptions.select = options.select;
    } else if (options.include) {
        queryOptions.include = options.include;
    }

    // === QUERY ===
    const [data, total] = await Promise.all([
        model.findMany(queryOptions),
        model.count({ where }),
    ]);

    return {
        data,
        meta: {
            total,
            page,
            perPage,
            totalPages: Math.ceil(total / perPage)
        },
    };
}
