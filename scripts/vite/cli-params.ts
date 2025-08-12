export function getCliParams<T extends string = string>(args: string[], delimiter = false) {
  const customArgs = delimiter ? args.slice(args.indexOf('--') + 1 || args.length) : args;

  return new Map<T, string>(
    customArgs
      .filter((arg) => arg.startsWith('--'))
      .map<[T, string]>((arg) => {
        const [paramName, ...paramValue] = arg.replace(/^--/, '').split('=');
        return [paramName as T, paramValue.join('=')];
      }),
  );
}
