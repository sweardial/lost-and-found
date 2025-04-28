import AWS from "aws-sdk";
import { AWS_ACCESS_KEY_ID, AWS_REGION, AWS_SECRET_ACCESS_KEY } from "./envs";

const AWS_SES = new AWS.SES({
  region: AWS_REGION,
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
});

interface SendEmailParams {
  email: string;
  code: string;
}

export const sendEmail = async ({ email, code }: SendEmailParams) => {
  const htmlBody = `
    <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://foundlynycsubway.com/mta_logo.png" alt="MTA Logo" style="height: 60px;">
      </div>
      <h2 style="text-align: center; color: #333;">Verification Code</h2>
      <p style="text-align: center; font-size: 24px; font-weight: bold; background-color: #f0f0f0; padding: 10px; border-radius: 5px;">
        ${code}
      </p>
      <p style="text-align: center; color: #777; font-size: 12px; margin-top: 20px;">
        This code will expire 10 minutes after it was sent.
      </p>
    </div>
  `;

  const params = {
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: {
          Data: htmlBody,
        },
      },
      Subject: {
        Data: "Your Verification Code",
      },
    },
    Source: "no-reply@foundlynycsubway.com",
  };

  try {
    const result = await AWS_SES.sendEmail(params).promise();

    console.log("Email sent:", result);
    return result;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
};
