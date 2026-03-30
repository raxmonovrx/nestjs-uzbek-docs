export function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[`~!@#$%^&*()+={[}\]|\\:;"'<>,.?/]/g, "")
    .replace(/\s+/g, "-")
}
