const accountUnsuspensionTemplate = (name) => {
  return `<!DOCTYPE html>
	<html>
	
	<head>
		<meta charset="UTF-8">
		<title>Account Restored</title>
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
				color: #059669;
			}
	
			.body {
				font-size: 16px;
				margin-bottom: 20px;
			}
	
			.cta {
				display: inline-block;
				padding: 10px 20px;
				background-color: #FFD60A;
				color: #000000;
				text-decoration: none;
				border-radius: 5px;
				font-size: 16px;
				font-weight: bold;
				margin-top: 20px;
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
			<div class="message">Account Restored</div>
			<div class="body">
				<p>Dear ${name},</p>
				<p>Good news! Your account on StudyNotion has been reactivated. You can now log in and resume your learning journey.</p>
				<a href="https://studynotion-edtech-project.vercel.app/login" class="cta">Login Now</a>
			</div>
			<div class="support">If you have any questions, please feel free to reach out to us at <a
					href="mailto:info@studynotion.com">info@studynotion.com</a>.</div>
		</div>
	</body>
	
	</html>`;
};
module.exports = accountUnsuspensionTemplate;
