const accountSuspensionTemplate = (name, reason) => {
  return `<!DOCTYPE html>
	<html>
	
	<head>
		<meta charset="UTF-8">
		<title>Account Suspended</title>
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
				color: #E53E3E;
			}
	
			.body {
				font-size: 16px;
				margin-bottom: 20px;
			}
	
			.reason-box {
				background-color: #FEB2B2;
				padding: 15px;
				border-radius: 5px;
				font-weight: bold;
				color: #742A2A;
				margin: 20px 0;
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
			<div class="message">Account Suspended</div>
			<div class="body">
				<p>Dear ${name},</p>
				<p>We regret to inform you that your account on StudyNotion has been suspended by the administrator.</p>
				<p><strong>Reason for Suspension:</strong></p>
				<div class="reason-box">${reason}</div>
				<p>During this suspension, you will not be able to log in or access your courses.</p>
			</div>
			<div class="support">If you wish to appeal this decision, please contact us at <a
					href="mailto:info@studynotion.com">info@studynotion.com</a>.</div>
		</div>
	</body>
	
	</html>`;
};
module.exports = accountSuspensionTemplate;
