export interface Meaning {
  anlam_id: string;
  anlam: string;
  orneklerListe?: { ornek: string; yazar?: { tam_adi: string } }[];
}

export interface WordData {
  madde_id: string;
  kac: string;
  kelime_no: string;
  cesit: string;
  anlam_gor: string;
  on_taki: string;
  madde: string;
  cesit_say: string;
  anlam_say: string;
  taki: string;
  cogul_mu: string;
  ozel_mi: string;
  lisan_kodu: string;
  lisan: string;
  telaffuz: string;
  birlesikler: string;
  font: string;
  madde_duz: string;
  gosterim_tarihi: string;
  anlamlarListe: Meaning[];
}
