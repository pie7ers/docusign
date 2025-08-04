export interface ITokens {
  refresh_token: string,
  access_token: string
}

export interface ISendEnvelopeResponse {
  envelopeId: string;
  uri?: string;
  statusDateTime?: string;
  status: string;
}

export interface ISigner {
  email: string;
  name: string;
  recipientId: string;
  clientUserId: string;
}

export interface IRecipientes {
  recipients: {
    signers: ISigner[];
  };
}