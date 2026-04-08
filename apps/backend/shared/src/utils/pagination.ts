export function encodeCursor(id: string, createdAt: string): string {
  return Buffer.from(`${createdAt}|${id}`).toString('base64url');
}

export function decodeCursor(cursor: string): { id: string; createdAt: string } | null {
  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf-8');
    const [createdAt, id] = decoded.split('|');
    if (!createdAt || !id) return null;
    return { id, createdAt };
  } catch {
    return null;
  }
}

export function paginatedResponse<T>(items: T[], limit: number, cursorField?: string) {
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;
  const lastItem = data[data.length - 1] as Record<string, unknown> | undefined;

  return {
    data,
    meta: {
      hasMore,
      cursor:
        lastItem && cursorField
          ? encodeCursor(lastItem['id'] as string, lastItem[cursorField] as string)
          : undefined,
    },
  };
}
