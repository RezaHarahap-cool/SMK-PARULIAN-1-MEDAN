import nodemailer from 'nodemailer';

// HARUS pakai "export const" agar bisa di-import oleh controller
export const sendResetPasswordEmail = async (userEmail, resetToken) => {
  try {
    // 1. Buat transporter (mesin pengirim) menggunakan konfigurasi Gmail di .env
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 2. Rakit URL pendaratan untuk Frontend React-mu
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // 3. Desain isi email dengan HTML sederhana tapi rapi
    const mailOptions = {
      from: `"Sistem Akademik SMK Parulian 1" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: 'Permintaan Reset Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Reset Password Anda</h2>
          <p style="color: #555; font-size: 16px;">
            Halo, kami menerima permintaan untuk mereset password akun Anda. 
            Jika ini memang Anda, silakan klik tombol di bawah ini untuk membuat password baru:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Reset Password Sekarang
            </a>
          </div>
          <p style="color: #777; font-size: 14px; text-align: center;">
            Link ini hanya berlaku selama <strong>15 menit</strong>.<br>
            Jika Anda tidak merasa meminta reset password, abaikan saja email ini.
          </p>
        </div>
      `,
    };

    // 4. Perintahkan mesin untuk mengirim
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email reset password berhasil dikirim ke: ${userEmail}`);
    return true;

  } catch (error) {
    console.error("❌ Gagal mengirim email:", error);
    return false;
  }
};