import { RegisterEmployeeForm } from "@/app/(auth)/register/employee/components/RegisterEmployeeForm";
import { AuthFormShell } from "@/app/(auth)/components/AuthFormShell";
import { buildPageMetadata } from "@/lib/support/seo/metadata";

export const metadata = buildPageMetadata({
  title: "Đăng ký nhân viên",
  description: "Tạo tài khoản nhân viên và tham gia tổ chức trên Wokki.",
  path: "/register/employee",
});

export default function RegisterEmployeePage() {
  return (
    <AuthFormShell title="Đăng ký nhân viên">
      <RegisterEmployeeForm />
    </AuthFormShell>
  );
}
