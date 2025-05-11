import pkg from '../../../../package.json';

export async function GET() {
  return Response.json({ version: pkg.version });
}
