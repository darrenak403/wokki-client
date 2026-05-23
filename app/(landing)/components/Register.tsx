"use client";

import { useState } from "react";
import { useRegister } from "@/features/waitlist/hooks/useRegister";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RocketIcon from "@/components/ui/rocket-icon";

type ContactType = "email" | "phone";

export default function Register() {
  const [contactType, setContactType] = useState<ContactType>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const { mutate, isPending, isSuccess } = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralCode) return;
    mutate({
      email: contactType === "email" ? email : "",
      phone_number: contactType === "phone" ? phone : "",
      full_name: fullName,
      referral_code: referralCode,
    });
  };

  return (
    <section id="dang-ky" className="w-full bg-white dark:bg-neutral-950 py-24 scroll-mt-16 transition-colors duration-300">
      <div className="mx-auto max-w-2xl px-6">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full border border-neutral-300 dark:border-neutral-700 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Danh sách chờ
          </span>
          <h2 className="mt-4 text-3xl font-bold text-neutral-900 dark:text-white md:text-4xl lg:text-5xl">
            Sẵn sàng dùng thử{" "}
            <span className="bg-gradient-to-r from-[#102854] via-[#4C88C6] to-[#1D4D8F] bg-clip-text text-transparent">
              Wokki?
            </span>
          </h2>
          <p className="mt-3 text-base text-neutral-500 dark:text-neutral-400">
            Đăng ký chỉ mất 30 giây — hoàn toàn miễn phí, không ràng buộc.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 md:p-10 shadow-sm">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF6FB] dark:bg-[#0B1E3D] text-3xl">
                🎉
              </div>
              <p className="text-xl font-bold text-neutral-900 dark:text-white">
                Đăng ký thành công!
              </p>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                Chúng tôi sẽ liên hệ bạn sớm nhất có thể. Cảm ơn bạn đã tin
                tưởng Wokki!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <Label
                  htmlFor="full_name"
                  className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Họ và tên <span className="font-normal text-red-500">*</span>
                </Label>
                <Input
                  id="full_name"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-700"
                />
              </div>

              {/* Email or Phone */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {contactType === "email" ? "Email của bạn" : "Số điện thoại của bạn"}{" "}
                    <span className="font-normal text-red-500">*</span>
                  </Label>
                  <button
                    type="button"
                    onClick={() => setContactType(contactType === "email" ? "phone" : "email")}
                    className="cursor-pointer text-xs font-medium text-[#4C88C6] hover:text-[#1D4D8F] transition-colors"
                  >
                    Dùng {contactType === "email" ? "SĐT" : "Email"} thay
                  </button>
                </div>
                {contactType === "email" ? (
                  <Input
                    id="email"
                    type="email"
                    placeholder="ban@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-700"
                  />
                ) : (
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0912 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:bg-white dark:focus:bg-neutral-700"
                  />
                )}
              </div>

              {/* Referral — full width */}
              <div>
                <Label className="mb-2.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Người giới thiệu <span className="font-normal text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
                  {([
                    { name: "Như Phương", role: "CEO", avatar: "/phuong.png" },
                    { name: "Thái Hòa", role: "Finance", avatar: "/thaihoa.png" },
                    { name: "Minh Quang", role: "Marketing", avatar: "/quang.png" },
                    { name: "Phú Thịnh", role: "Developer", avatar: "/thinh.png" },
                    { name: "Phương Hòa", role: "Tech Lead", avatar: "/phuonghoa.png" },
                    { name: "Thành Đạt", role: "Engineer", avatar: "/dat.png" },
                  ] as const).map(({ name, role, avatar }) => {
                    const selected = referralCode === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setReferralCode(selected ? "" : name)}
                        className={`cursor-pointer group relative flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all duration-200 ${
                          selected
                            ? "border-[#4C88C6] dark:border-[#6AAED9] bg-[#EEF6FB] dark:bg-[#0B1E3D] shadow-sm ring-1 ring-[#BCE8F5] dark:ring-[#4C88C6]"
                            : "border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                        }`}
                      >
                        <div
                          className={`relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 transition-all duration-200 ${
                            selected ? "ring-[#4C88C6]" : "ring-neutral-200 group-hover:ring-neutral-300"
                          }`}
                        >
                          <img src={avatar} alt={name} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-semibold truncate transition-colors duration-200 ${selected ? "text-[#102854] dark:text-[#BCE8F5]" : "text-neutral-800 dark:text-neutral-200"}`}>
                            {name}
                          </p>
                          <p className={`text-xs truncate transition-colors duration-200 ${selected ? "text-[#1D4D8F] dark:text-[#6AAED9]" : "text-neutral-400 dark:text-neutral-500"}`}>
                            {role}
                          </p>
                        </div>
                        {selected && (
                          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#102854] to-[#4C88C6] shadow-sm">
                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending || !referralCode}
                size="lg"
                className="w-full bg-gradient-to-r from-[#102854] via-[#4C88C6] to-[#1D4D8F] text-white font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#4C88C6]/30 disabled:opacity-60 disabled:translate-y-0"
              >
                <RocketIcon size={18} className="mr-2" />
                {isPending ? "Đang gửi..." : "Đăng ký ngay"}
              </Button>

              <p className="text-center text-xs text-neutral-400">
                Hoàn toàn miễn phí · Không spam · Huỷ bất kỳ lúc nào
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
