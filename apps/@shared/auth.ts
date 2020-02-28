export interface DecodedIdTokenData {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
}

export function getAuthenticatedUserData(ctx: any): DecodedIdTokenData {
  const userData: DecodedIdTokenData = JSON.parse(ctx.request.headers['x-user-data']);
  return userData;
}
