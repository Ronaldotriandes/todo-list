
export interface QueryParams {
    page?: number | string;
    perpage?: number | string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    [key: string]: any;
}

export function parseArrayValue(value: any): string[] {
    if (Array.isArray(value)) {
        return value.map(v => String(v)).filter(v => v.trim() !== '');
    }
    if (typeof value === 'string' && value.includes(',')) {
        return value.split(',').map(v => v.trim()).filter(v => v !== '');
    }
    return value ? [String(value)] : [];
}

export function buildWhereLikeCondition(field: string, value: any): any {
    const parsedValues = parseArrayValue(value);

    if (parsedValues.length === 0) return null;

    if (parsedValues.length === 1) {
        if (field.includes('.')) {
            const parts = field.split('.');
            let nested: any = {};
            let current = nested;

            parts.forEach((p, idx) => {
                if (idx === parts.length - 1) {
                    current[p] = { contains: parsedValues[0], mode: 'insensitive' };
                } else {
                    current[p] = {};
                    current = current[p];
                }
            });
            return nested;
        } else {
            return { [field]: { contains: parsedValues[0], mode: 'insensitive' } };
        }
    } else {
        return parsedValues.map(v => ({
            [field]: { contains: v, mode: 'insensitive' }
        }));
    }
}

export async function QueryGetAll(
    model: any,
    quer: QueryParams = {},
    searchFields: string[] = [],
    options: {
        select?: any;
        include?: any;
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

    // 5. LIKE (wherelike-)
    Object.keys(quer).forEach((key) => {
        if (key.startsWith('wherelike-')) {
            const field = key.replace('wherelike-', '');
            const value = quer[key];

            const condition = buildWhereLikeCondition(field, value);
            if (condition) {
                if (Array.isArray(condition)) {
                    if (!where.OR) where.OR = [];
                    where.OR.push(...condition);
                } else {
                    Object.assign(where, condition);
                }
            }
        }
    });

    // 6. Default equality
    Object.keys(quer).forEach((key) => {
        if (key.startsWith('where-') && !key.startsWith('wherelike-')) {
            const field = key.replace('where-', '');
            const value = quer[key];

            const parsedValues = parseArrayValue(value);

            if (parsedValues.length > 1) {
                where[field] = { in: parsedValues };
            } else if (parsedValues.length === 1) {
                if (field.includes('.')) {
                    const parts = field.split('.');
                    let nested: any = {};
                    let current = nested;

                    parts.forEach((p, idx) => {
                        if (idx === parts.length - 1) {
                            current[p] = parsedValues[0];
                        } else {
                            current[p] = {};
                            current = current[p];
                        }
                    });
                    Object.assign(where, nested);
                } else {
                    where[field] = parsedValues[0];
                }
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
