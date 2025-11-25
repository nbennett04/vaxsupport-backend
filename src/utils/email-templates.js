const resetPasswordEmailTemplate = `
<!doctype html>
<html lang="en">
<head>
  <style>
      @media (max-width: 768px) {
          table {
              padding: 1rem !important;
          }

          td {
              width: 100% !important;
          }
      }

      @media (max-width: 400px) {
          table {
              padding: 0 !important;
          }
      }
  </style>
</head>
<body style="background:#F7F7F8;">
<table style=" padding: 4rem 100px; margin: auto">
  <tr>
    <td
      style=" width: 454px; flex-direction: column; justify-content: center; align-items: center; border-radius: 0.5rem; border: 1px solid #F9FAFB; background: white;">
      <header
        style=" padding: 32px; border-radius: 0.5rem 0.5rem 0 0; background: #000;">
        <div style="margin: auto; width: fit-content; display: flex">
          <img
            src="https://vax-support-public-assets.s3.us-east-1.amazonaws.com/logo-with-title.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAR3HUOWON2OCJACZH%2F20250225%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250225T133506Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEA4aCXVzLWVhc3QtMSJHMEUCIC%2F9U1gkkHVTyInXcl5TqjR7Xts7abgWuzOSwL7vO%2FcDAiEAmpTgu8wT4o61d6WIns%2BgMjuy%2Bz0%2BQ63wDdZCyxWTBTIq6AIIRxAAGgwxMjcyMTQyMDM4MDMiDKhL8a28sTb%2BWWZ2QCrFAoXTMEBO0S0tH7kSQfOOk4NJb%2FqtmmJ12iJALLspQfWYPNq%2BHKKM%2FaDyTeIJlaBmOR7PqbewqVRqS9L7hAjSYR7paoR1aoTD72V6yfqurPmyA3nGvMfxAjKr%2BS%2BDkaTFXXo2o5gISzTTZ4H1VNQcL43LNp%2BSFaQ5ye%2BPEVfWQfiyfaVeQGdDI4a8hI6p2%2B7LAQhjyfleKiS%2FmoaeI2fjmwuR7tMuCX6svaKxzbgPdGnahXExT3%2BKGcnAwbnBeTIjFO1eKqyv%2BmtKPZvTUwe4uayGW4SASOVzhpIVFzb6qSl9N%2BwToFO18LIH2K0zCnLa%2B%2BH9F39owaFDOiRHJnVkFjZ4JGeFw7JUgIzEGAkyYxcnQjn5Sg3qqnChQ%2BF%2B3p1s%2Fe8w031knzrAQbbmVdNqvI%2F6tht7k101%2BnGqMGheA0TYLjaTm%2BIw%2FIv3vQY6swLb2UQvaiMPScWLx9EyojSUraBvSfvFCxuMVz3Mm03Fp9%2Bmamm3xztx9d9TY06WYqQObNHDbz8C5pH%2F%2BEH66N1JZxmYM7lzOa4Yis3UJnUUiK1uSBSoaI%2BQHgsusUSTZmv8rKmZd8hItS9CrLEGJi01%2FW%2B03gBkNj%2F3oxcJxBEkP9DlH6EGE4uqr7BCvuNqORQtbdujPwpUxVpLb6jz8syAbFCz6nlq%2FpCTDtiXHRA1ZglxbmLZ9dUnOf2LtVvh%2F%2FIYQiWj68Pd5hzsJT8OZQFX6u5JLl7BBV%2B7mZyvjiynQho0c4nyG9IcO9Y3G6dpBiIWN6PIN7dRey9D2ytEIvtA6f8kp7eOQv81TVjXgqEgKMEqDjX0SgQqtprnTNNPXItUqSqkAhVafbb7mNhAM2pQU4TM&X-Amz-Signature=a4e1593f21ee74435d2a3df120190c384bc012128faefe8b6934b5e0bb6aa5ee&X-Amz-SignedHeaders=host&response-content-disposition=inline" />
        </div>
      </header>
      <div
        style="text-align: center; padding: 32px 24px; flex-direction: column; align-items: center; gap: 16px; align-self: stretch;">
        <h1
          style="color:#0E0E11; font-size: 1.25rem; font-weight: 600; line-height: 28px; text-transform: none;">
          Hello, {{name}}
        </h1>

        <p
          style="text-align: center; color: #374151; font-size: 0.875rem; font-weight: 400; line-height: 20px; text-transform: none;">
          You have requested a password reset for your VaxSupport account.
        </p>

        <p
          style="text-align: center; color: #374151; font-size: 0.875rem; font-weight: 400; line-height: 20px; text-transform: none;">
          Below is your new temporary password:
        </p>

        <p
          style="font-size: 1rem; font-weight: 600; color: #000; background: #f3f4f6; padding: 10px 20px; display: inline-block; border-radius: 5px;">
          <strong>{{newPassword}}</strong>
        </p>

        <p
          style="text-align: center; color: #374151; font-size: 0.875rem; font-weight: 400; line-height: 20px; text-transform: none;">
          Please log in using this password and change it immediately for
          security purposes.
        </p>
        <p
          style="text-align: center; color: rgb(107, 114, 128); font-size: 0.875rem; font-weight: 400; line-height: 20px; text-transform: none;">
          If you did not request this reset, please contact support immediately.
        </p>
        <p
          style="text-align: center; color: rgb(107, 114, 128); font-size: 0.875rem; font-weight: 400; line-height: 20px; text-transform: none;">
          Regards,
        </p>
        <p
          style="text-align: center; color: rgb(107, 114, 128); font-size: 0.875rem; font-weight: 400; line-height: 20px; text-transform: none;">
          Team VaxSupport
        </p>
      </div>
    </td>
  </tr>
  <tr>
    <td style="width: 454px; padding: 24px 16px;">
      <p
        style="color:#6B7280; text-align: center; font-size: 0.75rem; font-weight: 400; line-height: 16px; text-transform: none;">
        This message was sent automatically using VaxSupport.</p>
    </td>
  </tr>
</table>
</body>
</html>
`;

const welcomeEmailTemplate = `<!doctype html>
<html lang="en">
<head>
  <style>
      @media (max-width: 768px) {
          table {
              padding: 1rem !important;
          }

          td {
              width: 100% !important;
          }
      }

      @media (max-width: 400px) {
          table {
              padding: 0 !important;
          }
      }
  </style>
</head>
<body style="background:#F7F7F8;">
<table style=" padding: 4rem 100px; margin: auto">
  <tr>
    <td
      style=" width: 454px; flex-direction: column; justify-content: center; align-items: center; border-radius: 0.5rem; border: 1px solid #F9FAFB; background: white;">
      <header
        style=" padding: 32px; border-radius: 0.5rem 0.5rem 0 0; background: #000;">
        <div style="margin: auto; width: fit-content; display: flex">
          <img
            src="https://vax-support-public-assets.s3.us-east-1.amazonaws.com/logo-with-title.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAR3HUOWON2OCJACZH%2F20250225%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250225T133506Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEA4aCXVzLWVhc3QtMSJHMEUCIC%2F9U1gkkHVTyInXcl5TqjR7Xts7abgWuzOSwL7vO%2FcDAiEAmpTgu8wT4o61d6WIns%2BgMjuy%2Bz0%2BQ63wDdZCyxWTBTIq6AIIRxAAGgwxMjcyMTQyMDM4MDMiDKhL8a28sTb%2BWWZ2QCrFAoXTMEBO0S0tH7kSQfOOk4NJb%2FqtmmJ12iJALLspQfWYPNq%2BHKKM%2FaDyTeIJlaBmOR7PqbewqVRqS9L7hAjSYR7paoR1aoTD72V6yfqurPmyA3nGvMfxAjKr%2BS%2BDkaTFXXo2o5gISzTTZ4H1VNQcL43LNp%2BSFaQ5ye%2BPEVfWQfiyfaVeQGdDI4a8hI6p2%2B7LAQhjyfleKiS%2FmoaeI2fjmwuR7tMuCX6svaKxzbgPdGnahXExT3%2BKGcnAwbnBeTIjFO1eKqyv%2BmtKPZvTUwe4uayGW4SASOVzhpIVFzb6qSl9N%2BwToFO18LIH2K0zCnLa%2B%2BH9F39owaFDOiRHJnVkFjZ4JGeFw7JUgIzEGAkyYxcnQjn5Sg3qqnChQ%2BF%2B3p1s%2Fe8w031knzrAQbbmVdNqvI%2F6tht7k101%2BnGqMGheA0TYLjaTm%2BIw%2FIv3vQY6swLb2UQvaiMPScWLx9EyojSUraBvSfvFCxuMVz3Mm03Fp9%2Bmamm3xztx9d9TY06WYqQObNHDbz8C5pH%2F%2BEH66N1JZxmYM7lzOa4Yis3UJnUUiK1uSBSoaI%2BQHgsusUSTZmv8rKmZd8hItS9CrLEGJi01%2FW%2B03gBkNj%2F3oxcJxBEkP9DlH6EGE4uqr7BCvuNqORQtbdujPwpUxVpLb6jz8syAbFCz6nlq%2FpCTDtiXHRA1ZglxbmLZ9dUnOf2LtVvh%2F%2FIYQiWj68Pd5hzsJT8OZQFX6u5JLl7BBV%2B7mZyvjiynQho0c4nyG9IcO9Y3G6dpBiIWN6PIN7dRey9D2ytEIvtA6f8kp7eOQv81TVjXgqEgKMEqDjX0SgQqtprnTNNPXItUqSqkAhVafbb7mNhAM2pQU4TM&X-Amz-Signature=a4e1593f21ee74435d2a3df120190c384bc012128faefe8b6934b5e0bb6aa5ee&X-Amz-SignedHeaders=host&response-content-disposition=inline" />
        </div>
      </header>
      <div
        style="text-align: center; padding: 32px 24px; flex-direction: column; align-items: center; gap: 16px; align-self: stretch;">
        <h1
          style="color:#0E0E11; font-size: 1.25rem; font-weight: 600; line-height: 28px; text-transform: none;">
          Welcome to VaxSupport, {{firstName}}!
        </h1>

        <p
          style="text-align: center; color: #374151; font-size: 0.875rem; font-weight: 400; line-height: 20px; text-transform: none;">
          We're excited to have you on board. Your account has been successfully
          created, and you're now part of our community!
        </p>
        <br />
        <a href="https://app.vaccinesupport.co/en/sign-in"
           style="margin: auto; text-align: center; padding: 12px 16px; align-items: flex-start; gap: 8px; border-radius: 8px; background: #84cc16; color: black; cursor: pointer; text-decoration: none; font-size: 1rem; font-weight: 500; line-height:20px; text-transform: none;">
          Login Now
        </a>
        <br />
        <br />

        <p
          style="text-align: center; color: rgb(107, 114, 128); font-size: 0.875rem; font-weight: 400; line-height: 20px; text-transform: none;">
          If you have any questions or need help, feel free to reach out to our
          support team.
        </p>

        <p
          style="text-align: center; color: rgb(107, 114, 128); font-size: 0.875rem; font-weight: 400; line-height: 20px; text-transform: none;">
          Best Regards,
        </p>
        <p
          style="text-align: center; color: rgb(107, 114, 128); font-size: 0.875rem; font-weight: 400; line-height: 20px; text-transform: none;">
          Team VaxSupport
        </p>
      </div>

    </td>
  </tr>
  <tr>
    <td style="width: 454px; padding: 24px 16px;">
      <p
        style="color:#6B7280; text-align: center; font-size: 0.75rem; font-weight: 400; line-height: 16px; text-transform: none;">
        This message was sent automatically using VaxSupport.</p>
    </td>
  </tr>
</table>
</body>
</html>
`;

const inviteFriendEmailTemplate = `<!doctype html>
<html lang="en">
<head>
  <style>
      @media (max-width: 768px) {
          table {
              padding: 1rem !important;
          }

          td {
              width: 100% !important;
          }
      }

      @media (max-width: 400px) {
          table {
              padding: 0 !important;
          }
      }
  </style>
</head>
<body style="background:#F7F7F8;">
<table style=" padding: 4rem 100px; margin: auto">
  <tr>
    <td
      style=" width: 454px; flex-direction: column; justify-content: center; align-items: center; border-radius: 0.5rem; border: 1px solid #F9FAFB; background: white;">
      <header
        style=" padding: 32px; border-radius: 0.5rem 0.5rem 0 0; background: #000;">
        <div style="margin: auto; width: fit-content; display: flex">
          <img
            src="https://vax-support-public-assets.s3.us-east-1.amazonaws.com/logo-with-title.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAR3HUOWON2OCJACZH%2F20250225%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250225T133506Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEA4aCXVzLWVhc3QtMSJHMEUCIC%2F9U1gkkHVTyInXcl5TqjR7Xts7abgWuzOSwL7vO%2FcDAiEAmpTgu8wT4o61d6WIns%2BgMjuy%2Bz0%2BQ63wDdZCyxWTBTIq6AIIRxAAGgwxMjcyMTQyMDM4MDMiDKhL8a28sTb%2BWWZ2QCrFAoXTMEBO0S0tH7kSQfOOk4NJb%2FqtmmJ12iJALLspQfWYPNq%2BHKKM%2FaDyTeIJlaBmOR7PqbewqVRqS9L7hAjSYR7paoR1aoTD72V6yfqurPmyA3nGvMfxAjKr%2BS%2BDkaTFXXo2o5gISzTTZ4H1VNQcL43LNp%2BSFaQ5ye%2BPEVfWQfiyfaVeQGdDI4a8hI6p2%2B7LAQhjyfleKiS%2FmoaeI2fjmwuR7tMuCX6svaKxzbgPdGnahXExT3%2BKGcnAwbnBeTIjFO1eKqyv%2BmtKPZvTUwe4uayGW4SASOVzhpIVFzb6qSl9N%2BwToFO18LIH2K0zCnLa%2B%2BH9F39owaFDOiRHJnVkFjZ4JGeFw7JUgIzEGAkyYxcnQjn5Sg3qqnChQ%2BF%2B3p1s%2Fe8w031knzrAQbbmVdNqvI%2F6tht7k101%2BnGqMGheA0TYLjaTm%2BIw%2FIv3vQY6swLb2UQvaiMPScWLx9EyojSUraBvSfvFCxuMVz3Mm03Fp9%2Bmamm3xztx9d9TY06WYqQObNHDbz8C5pH%2F%2BEH66N1JZxmYM7lzOa4Yis3UJnUUiK1uSBSoaI%2BQHgsusUSTZmv8rKmZd8hItS9CrLEGJi01%2FW%2B03gBkNj%2F3oxcJxBEkP9DlH6EGE4uqr7BCvuNqORQtbdujPwpUxVpLb6jz8syAbFCz6nlq%2FpCTDtiXHRA1ZglxbmLZ9dUnOf2LtVvh%2F%2FIYQiWj68Pd5hzsJT8OZQFX6u5JLl7BBV%2B7mZyvjiynQho0c4nyG9IcO9Y3G6dpBiIWN6PIN7dRey9D2ytEIvtA6f8kp7eOQv81TVjXgqEgKMEqDjX0SgQqtprnTNNPXItUqSqkAhVafbb7mNhAM2pQU4TM&X-Amz-Signature=a4e1593f21ee74435d2a3df120190c384bc012128faefe8b6934b5e0bb6aa5ee&X-Amz-SignedHeaders=host&response-content-disposition=inline" />
        </div>
      </header>
      <div
        style="text-align: center; padding: 32px 24px; flex-direction: column; align-items: center; gap: 16px; align-self: stretch;">
        <h1
          style="color:#0E0E11; font-size: 1.25rem; font-weight: 600; line-height: 28px; text-transform: none;">
          Hi, {{name}}!
        </h1>

        <p
          style="text-align: center; color: #374151; font-size: 0.875rem; font-weight: 400; line-height: 20px; text-transform: none;">
          Your friend {{friendName}} thought you’d find the site VaxSupport
          helpful for
          answering vaccine related questions. We welcome anyone and everyone.
          Jump on over to VaxSupport and click “Ask a Vaccine Question” to get
          started. We want to help!
        </p>
        <br />
        <a href="https://www.vaccinesupport.co"
           style="margin: auto; text-align: center; padding: 12px 16px; align-items: flex-start; gap: 8px; border-radius: 8px; background: #84cc16; color: black; cursor: pointer; text-decoration: none; font-size: 1rem; font-weight: 500; line-height:20px; text-transform: none;">
          Visit Now
        </a>
        <br />
        <br />

        <p
          style="text-align: center; color: rgb(107, 114, 128); font-size: 0.875rem; font-weight: 400; line-height: 20px; text-transform: none;">
          If you have any questions or need help, feel free to reach out to our
          support team.
        </p>

        <p
          style="text-align: center; color: rgb(107, 114, 128); font-size: 0.875rem; font-weight: 400; line-height: 20px; text-transform: none;">
          Thanks,
        </p>
        <p
          style="text-align: center; color: rgb(107, 114, 128); font-size: 0.875rem; font-weight: 400; line-height: 20px; text-transform: none;">
          Team VaxSupport
        </p>
      </div>

    </td>
  </tr>
  <tr>
    <td style="width: 454px; padding: 24px 16px;">
      <p
        style="color:#6B7280; text-align: center; font-size: 0.75rem; font-weight: 400; line-height: 16px; text-transform: none;">
        This message was sent automatically using VaxSupport.</p>
    </td>
  </tr>
</table>
</body>
</html>
`;

module.exports = {
	resetPasswordEmailTemplate,
	welcomeEmailTemplate,
	inviteFriendEmailTemplate
};