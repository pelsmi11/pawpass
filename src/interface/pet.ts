export type PetType = {
  id: string;
  code: string;
  title: string;
};

export type PetTypeOption = {
  id: string;
  label: string;
};

export type Pet = {
  id: string;
  name: string;
  petTypeId: string;
  age: number | null;
  ownerName: string;
  createdAt: string;
  petType: PetType;
};

export type CreatePetInput = {
  name: string;
  petTypeId: string;
  age?: number;
  ownerName: string;
};

export type CreatePetResponse = {
  ok: true;
  pet: { name: string };
};
