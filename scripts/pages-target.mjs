/** Resolve the standard github.io URL; custom domains are not supported. */
export function pagesTarget(remote) {
  const match = remote.trim().match(
    /^(?:https:\/\/github\.com\/|git@github\.com:|ssh:\/\/git@github\.com\/)([a-z\d-]+)\/([a-z\d_.-]+?)(?:\.git)?\/?$/i,
  );
  if (!match || ['.', '..'].includes(match[2])) {
    throw new Error('Configura origin con una URL de GitHub (HTTPS o SSH), o usa --repo URL.');
  }
  const [, owner, repository] = match;
  const baseUrl = repository.toLowerCase() === `${owner.toLowerCase()}.github.io`
    ? '' : `/${repository}`;
  return { baseUrl, url: `https://${owner.toLowerCase()}.github.io${baseUrl}/` };
}
