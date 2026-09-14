import { useEffect, useMemo, useState } from "react";

import FaceScanner from "../components/face/FaceScanner";
import { getEmployees } from "../services/employeeApi";

export default function RegisterFace() {
  const [employees, setEmployees] = useState([]);

  const [userCode, setUserCode] = useState("");
  const [selectedEmployee, setSelectedEmployee] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // =========================
  // Load employees
  // =========================

  useEffect(() => {
    async function loadEmployees() {
      try {
        setLoading(true);
        setError("");

        const data = await getEmployees();

        setEmployees(data);
      } catch (err) {
        console.error(err);
        setError(
          err?.message ||
            "Không thể tải danh sách nhân viên"
        );
      } finally {
        setLoading(false);
      }
    }

    loadEmployees();
  }, []);

  // =========================
  // Search employees
  // =========================

  const filteredEmployees = useMemo(() => {
    const keyword = userCode
      .trim()
      .toLowerCase();

    if (!keyword) {
      return employees;
    }

    return employees.filter(
      (employee) =>
        employee.userCode
          ?.toLowerCase()
          .includes(keyword) ||
        employee.fullName
          ?.toLowerCase()
          .includes(keyword)
    );
  }, [employees, userCode]);

  // =========================
  // Select employee
  // =========================

  function handleSelectEmployee(employee) {
    setSelectedEmployee(employee);
    setUserCode(employee.userCode);
    setError("");
  }

  function handleReset() {
    setSelectedEmployee(null);
    setUserCode("");
    setError("");
  }

  // =========================
  // Render FaceScanner
  // =========================

  if (selectedEmployee) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-4xl p-4">
          <div className="mb-4 rounded-lg border bg-white p-4">
            <div className="text-sm text-gray-500">
              Nhân viên
            </div>

            <div className="text-lg font-semibold">
              {selectedEmployee.fullName}
            </div>

            <div className="text-sm text-gray-600">
              Mã NV: {selectedEmployee.userCode}
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="mt-3 rounded bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
            >
              Chọn nhân viên khác
            </button>
          </div>

          <FaceScanner
            mode="register"
            userId={selectedEmployee.id}
          />
        </div>
      </div>
    );
  }

  // =========================
  // Employee selection
  // =========================

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-xl">
        <h1 className="mb-6 text-2xl font-bold">
          Đăng ký khuôn mặt
        </h1>

        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <label className="mb-2 block text-sm font-medium">
            Nhân viên
          </label>

          <input
            type="text"
            value={userCode}
            onChange={(e) => {
              setUserCode(e.target.value);
              setSelectedEmployee(null);
              setError("");
            }}
            placeholder="Nhập mã NV hoặc tên nhân viên..."
            className="w-full rounded border px-3 py-2 outline-none focus:border-blue-500"
          />

          {loading && (
            <div className="mt-3 text-sm text-gray-500">
              Đang tải danh sách nhân viên...
            </div>
          )}

          {error && (
            <div className="mt-3 rounded bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            filteredEmployees.length === 0 && (
              <div className="mt-3 text-sm text-gray-500">
                Không tìm thấy nhân viên
              </div>
            )}

          {!loading &&
            filteredEmployees.length > 0 && (
              <div className="mt-3 max-h-80 overflow-y-auto rounded border">
                {filteredEmployees.map(
                  (employee) => (
                    <button
                      key={employee.id}
                      type="button"
                      onClick={() =>
                        handleSelectEmployee(
                          employee
                        )
                      }
                      className="flex w-full items-center justify-between border-b px-4 py-3 text-left last:border-b-0 hover:bg-gray-50"
                    >
                      <div>
                        <div className="font-medium">
                          {employee.fullName}
                        </div>

                        <div className="text-sm text-gray-500">
                          {employee.userCode}
                        </div>
                      </div>

                      <div>
                        {employee.hasFaceRegistered ? (
                          <span className="text-sm text-green-600">
                            Đã đăng ký
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">
                            Chưa đăng ký
                          </span>
                        )}
                      </div>
                    </button>
                  )
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
