export function toKebabCase(str: string) {
  return str
    .replace(/[^a-z\d]+/gi, ' ')
    .trim()
    .replace(/ /g, '-');
}

export function toPascalCase(str: string) {
  return (' ' + str.replace(/[^a-z\d]+/gi, ' ').trim()).replace(/ \w/g, (match) =>
    match[1].toUpperCase(),
  );
}
