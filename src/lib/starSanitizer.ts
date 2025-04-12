export default function starSanitizer(stars: string | undefined) {
  // Replace any comma followed by zero or more spaces with a comma and a single space
  return stars.replace(/,\s*/g, ", ");
}
