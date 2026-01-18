const accountDeletionTemplate = (name) => {
  return `<!DOCTYPE html>
	<html>
	
	<head>
		<meta charset="UTF-8">
		<title>Account Deleted</title>
		<style>
			body {
				background-color: #ffffff;
				font-family: Arial, sans-serif;
				font-size: 16px;
				line-height: 1.4;
				color: #333333;
				margin: 0;
				padding: 0;
			}
	
			.container {
				max-width: 600px;
				margin: 0 auto;
				padding: 20px;
				text-align: center;
			}
	
			.logo {
				max-width: 200px;
				margin-bottom: 20px;
			}
	
			.message {
				font-size: 18px;
				font-weight: bold;
				margin-bottom: 20px;
				color: #FF0000;
			}
	
			.body {
				font-size: 16px;
				margin-bottom: 20px;
			}
	
			.support {
				font-size: 14px;
				color: #999999;
				margin-top: 20px;
			}
		</style>
	
	</head>
	
	<body>
		<div class="container">
			<a href="https://studynotion-edtech-project.vercel.app"><img class="logo"
					src="https://i.ibb.co/7Xyj3PC/logo.png" alt="StudyNotion Logo"></a>
			<div class="message">Account Deleted</div>
			<div class="body">
				<p>Dear ${name},</p>
				<p>We are writing to inform you that your account on StudyNotion has been deleted by the administrator.</p>
				<p>If you believe this is an error, please contact our support team immediately.</p>
			</div>
			<div class="support">If you have any questions or need assistance, please feel free to reach out to us at <a
					href="mailto:info@studynotion.com">info@studynotion.com</a>.</div>
		</div>
	</body>
	
	</html>`;
};
module.exports = accountDeletionTemplate;
