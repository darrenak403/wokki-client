'use client';

import React from 'react';
import Ballpit from '../../../components/ui/Ballpit';
import { InteractiveHoverButton } from '../../../components/ui/interactive-hover-button';

const Conclusion: React.FC = () => {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-900">
      {/* Ballpit background — parent must be relative with explicit height */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            height: '100%',
          }}
        >
          <Ballpit
            count={120}
            colors={[0x402093, 0x8f58e4, 0x5e34b7]}
            ambientIntensity={0.8}
            lightIntensity={180}
            minSize={0.35}
            maxSize={0.9}
            gravity={0.01}
            friction={0.9975}
            wallBounce={0.95}
            followCursor={true}
          />
        </div>
      </div>

      {/* Subtle gradient at bottom only so text stays readable */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center md:px-10 md:py-28">
        <span className="mb-4 inline-flex rounded-full border border-[#BCE8F5]/30 bg-[#4C88C6]/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-[#BCE8F5]">
          Sẵn sàng thay đổi
        </span>

        <h2 className="text-3xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl">
          Quản lý ca làm
          <br />
          <span className="bg-gradient-to-r from-[#102854] via-[#4C88C6] to-[#1D4D8F] bg-clip-text text-transparent">
            thông minh hơn bao giờ hết.
          </span>
        </h2>

        <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
          AI xếp ca tự động · Chấm công GPS thời gian thực · Đổi ca một chạm — tất cả trong một nền tảng duy nhất.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <InteractiveHoverButton variant="light" className="text-sm">
            Trải nghiệm ngay
          </InteractiveHoverButton>
          <InteractiveHoverButton variant="dark" className="text-sm">
            Tìm hiểu thêm
          </InteractiveHoverButton>
        </div>

        <p className="mt-6 text-xs text-white/40">
          Hoàn toàn miễn phí · Không ràng buộc · Huỷ bất cứ lúc nào
        </p>
      </div>
    </section>
  );
};

export default Conclusion;