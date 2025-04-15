// sanitize netzkino Stars list which comes without spaces between stars

export default function starSanitizer(stars: string | undefined) {
  return stars.replace(/,\s*/g, ", ");
}
