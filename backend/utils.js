export function isValidPassword(password) {
    return (
        typeof password === "string" &&
        password.length >= 8 &&
        /[a-z]/.test(password) &&
        /[A-Z]/.test(password) &&
        /\d/.test(password)
    );
}

export function sanitizeUser(row) {
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role
    };
}

export function sanitizePoem(row) {
    return {
        id: row.id,
        title: row.title,
        content: row.content,
        createdAt:
            row.created_at instanceof Date
                ? row.created_at.toISOString()
                : row.created_at,
        authorId: row.author_id ?? null,
        galleryId: row.gallery_id ?? null
    };
}

export function sanitizeGallery(row) {
    return {
        id: row.id,
        name: row.name,
        createdAt:
            row.created_at instanceof Date
                ? row.created_at.toISOString()
                : row.created_at,
        authorId: row.author_id ?? null
    };
}

export function parseNumericId(value) {
    const parsed = typeof value === "string" ? Number(value) : value;
    return Number.isInteger(parsed) ? parsed : null;
}
