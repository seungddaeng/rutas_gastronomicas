export function dishKeyFromName(name: string) {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ñ/g, "n")
        .replace(/[^a-z0-9\s]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}
