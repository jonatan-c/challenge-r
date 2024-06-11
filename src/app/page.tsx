"use client";
import React, { useState } from "react";
import Papa from "papaparse";
import Image from "next/image";

type Socio = {
  id: number;
  name: string;
  age: number;
  team: string;
  condition: string;
  education: string;
};

const Home = () => {
  const [file, setFile] = useState<File | null>(null);
  const [partners, setPartners] = useState<Socio[]>([]);
  const [results, setResults] = useState<any | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const processAndCalculate = () => {
    if (!file) return;

    Papa.parse(file, {
      header: false,
      delimiter: ";",
      encoding: "ISO-8859-1",
      complete: (result) => {
        let partners = result.data.map((s: any, index: number) => ({
          id: index + 1,
          name: s[0],
          age: parseInt(s[1], 10),
          team: s[2],
          condition: s[3],
          education: s[4],
        }));

        partners.pop();

        setPartners(partners);

        const totalPartners = partners.length;

        const racingPartners = partners.filter((s) => s.team === "Racing");
        const averageAgeRacing =
          racingPartners.reduce((acc, s) => acc + s.age, 0) /
          racingPartners.length;

        const universityMarried = partners
          .filter(
            (s) => s.condition === "Casado" && s.education === "Universitario"
          )
          .sort((a, b) => a.age - b.age)
          .slice(0, 100)
          .map((s) => ({ name: s.name, age: s.age, team: s.team }));

        const fansRiver = partners.filter((s) => s.team === "River");
        const nombresMasComunesRiver = Object.entries(
          fansRiver.reduce((acc, s) => {
            acc[s.name] = (acc[s.name] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        )
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([name]) => name);

        const teams = Array.from(new Set(partners.map((s) => s.team)));
        const teamsStats = teams
          .map((team) => {
            const partnersTeam = partners.filter((s) => s.team === team);
            const totalAge = partnersTeam.reduce((acc, s) => acc + s.age, 0);
            const averageAge = totalAge / partnersTeam.length;
            const younger = Math.min(...partnersTeam.map((s) => s.age));
            const older = Math.max(...partnersTeam.map((s) => s.age));

            return {
              team,
              averageAge,
              younger,
              older,
              quantityPartners: partnersTeam.length,
            };
          })
          .sort((a, b) => b.quantityPartners - a.quantityPartners);

        setResults({
          totalPartners,
          averageAgeRacing,
          universityMarried,
          nombresMasComunesRiver,
          teamsStats,
        });
      },
    });
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const currentItems = results
    ? results.universityMarried.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    : [];

  return (
    <>
      <div className="flex flex-col lg:flex-row p-6 justify-center items-center lg:h-screen h-full">
        <div className="max-w-md mx-auto p-6 bg-white text-black rounded-lg shadow-md space-y-4 h-fit  lg:w-[50%] ">
          <div className="space-y-4 text-center">
            <label
              htmlFor="fileInput"
              className="flex flex-row items-cente justify-center gap-6 cursor-pointer"
            >
              <Image src="/mas.png" alt="Logo" width={50} height={50} />
              <div className="flex flex-col">
                <span>Añade tus archivos</span>
                <span className="underline">o seleccione una carpeta</span>
              </div>
            </label>
            <input
              id="fileInput"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={processAndCalculate}
              disabled={!file}
              className="w-52 bg-blue-500   hover:bg-blue-700 text-white font-bold py-2 mt-12 px-4 rounded-3xl disabled:opacity-50"
            >
              Enviar
            </button>
          </div>
        </div>

        <div className="space-y-4 mt-4 lg:w-[50%] w-full justify-normal items-start h-full">
          {results && (
            <div className="space-y-4 mt-4">
              <h3 className="font-semibold">
                Total de personas registradas: {results.totalPartners}
              </h3>
              <h3 className="font-semibold">
                Promedio de edad de los partners de Racing:{" "}
                {results.averageAgeRacing.toFixed(2)}
              </h3>

              <div>
                <h3 className="font-semibold mb-4">
                  Primeras 100 personas casadas con estudios universitarios
                </h3>
                <ul className="pl-5 text-center list-none">
                  {currentItems.map((s: Socio, index: number) => (
                    <li key={index}>
                      {s.name}, {s.age} años, {s.team}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-row justify-center mt-4">
                  Página {currentPage} de{" "}
                  {results
                    ? Math.ceil(results.universityMarried.length / itemsPerPage)
                    : 1}
                </div>
                <div className="flex flex-row justify-center mt-4">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="mr-2 border border-gray-300 px-2 py-1 rounded-lg"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={
                      results
                        ? currentPage ===
                          Math.ceil(
                            results.universityMarried.length / itemsPerPage
                          )
                        : true
                    }
                    className="mr-2 border border-gray-300 px-2 py-1 rounded-lg"
                  >
                    Siguiente
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold">
                  5 nombres más comunes entre los hinchas de River
                </h3>
                <ul className="list-none pl-5">
                  {results.nombresMasComunesRiver.map(
                    (name: string, index: string) => (
                      <li key={index}>{name}</li>
                    )
                  )}
                </ul>
              </div>

              <div className="mb-10 pb-10">
                <h3 className="font-semibold">Estadísticas por team</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 table-fixed text-white">
                    <thead className="bg-slate-400 divide-y divide-gray-200 dark:bg-slate-700 mb-6 text-white  ">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium   uppercase tracking-wider">
                          Equipo
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium   uppercase tracking-wider">
                          Cantidad Socios
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium   uppercase tracking-wider">
                          Edad Promedio
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium   uppercase tracking-wider">
                          Menor Edad
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium   uppercase tracking-wider">
                          Mayor Edad
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-slate-400 divide-y divide-gray-200 dark:bg-slate-700 mb-6">
                      {results.teamsStats.map((e: any, index: string) => (
                        <tr key={index}>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {e.team}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {e.quantityPartners}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {e.averageAge.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {e.younger}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {e.older}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
