import { Link } from "react-router-dom";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 px-5 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.14)] lg:grid-cols-[0.9fr_1.1fr]">
          <section className="bg-[#102a43] px-7 py-10 text-white sm:px-10 sm:py-14 lg:px-12">
            <div className="flex h-full flex-col justify-between gap-14">
              <div>
                <div className="mb-8 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2dd4bf] text-lg font-black text-[#102a43]">
                    HR
                  </div>
                  <div>
                    <p className="text-sm font-semibold tracking-[0.18em] text-teal-200">
                      HRM SYSTEM
                    </p>
                    <p className="text-xs text-slate-300">
                      Face attendance
                    </p>
                  </div>
                </div>

                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                  Employee access
                </p>
                <h1 className="max-w-md text-4xl font-bold tracking-tight sm:text-5xl">
                  Face Attendance
                </h1>
                <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
                  Quản lý đăng ký khuôn mặt và chấm công nhanh chóng trong một nơi.
                </p>
              </div>

              <div className="border-l-2 border-teal-300/60 pl-4 text-sm leading-6 text-slate-300">
                Đảm bảo khuôn mặt nằm trong khung trước khi bắt đầu.
              </div>
            </div>
          </section>

          <section className="px-7 py-10 sm:px-10 sm:py-14 lg:px-12">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Quick actions
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[#102a43]">
                Bạn muốn làm gì?
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Chọn một tác vụ để tiếp tục.
              </p>
            </div>

            <div className="grid gap-4">
          <Link
            to="/register-face"
            className="group flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-5 py-5 text-left transition hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
          >
            <span>
              <span className="block text-base font-bold text-amber-950">
                Register Face
              </span>
              <span className="mt-1 block text-sm text-amber-800/75">
                Thêm hoặc cập nhật khuôn mặt nhân viên
              </span>
            </span>
            <span className="text-xl font-semibold text-amber-700 transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>

          <Link
            to="/check-in"
            className="group flex items-center justify-between rounded-2xl border border-teal-200 bg-teal-50 px-5 py-5 text-left transition hover:-translate-y-0.5 hover:border-teal-300 hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            <span>
              <span className="block text-base font-bold text-teal-950">
                Check In
              </span>
              <span className="mt-1 block text-sm text-teal-800/75">
                Xác nhận có mặt bằng khuôn mặt
              </span>
            </span>
            <span className="text-xl font-semibold text-teal-700 transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
