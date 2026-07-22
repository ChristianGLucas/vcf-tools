// package: christiangeorgelucas.vcf_tools
// file: messages.proto

import * as jspb from "google-protobuf";

export class Error extends jspb.Message {
  getCode(): string;
  setCode(value: string): void;

  getMessage(): string;
  setMessage(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Error.AsObject;
  static toObject(includeInstance: boolean, msg: Error): Error.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Error, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Error;
  static deserializeBinaryFromReader(message: Error, reader: jspb.BinaryReader): Error;
}

export namespace Error {
  export type AsObject = {
    code: string,
    message: string,
  }
}

export class VcfInput extends jspb.Message {
  getVcfText(): string;
  setVcfText(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): VcfInput.AsObject;
  static toObject(includeInstance: boolean, msg: VcfInput): VcfInput.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: VcfInput, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): VcfInput;
  static deserializeBinaryFromReader(message: VcfInput, reader: jspb.BinaryReader): VcfInput;
}

export namespace VcfInput {
  export type AsObject = {
    vcfText: string,
  }
}

export class FieldDef extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getNumber(): string;
  setNumber(value: string): void;

  getType(): string;
  setType(value: string): void;

  getDescription(): string;
  setDescription(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FieldDef.AsObject;
  static toObject(includeInstance: boolean, msg: FieldDef): FieldDef.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FieldDef, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FieldDef;
  static deserializeBinaryFromReader(message: FieldDef, reader: jspb.BinaryReader): FieldDef;
}

export namespace FieldDef {
  export type AsObject = {
    id: string,
    number: string,
    type: string,
    description: string,
  }
}

export class FilterDef extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getDescription(): string;
  setDescription(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FilterDef.AsObject;
  static toObject(includeInstance: boolean, msg: FilterDef): FilterDef.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FilterDef, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FilterDef;
  static deserializeBinaryFromReader(message: FilterDef, reader: jspb.BinaryReader): FilterDef;
}

export namespace FilterDef {
  export type AsObject = {
    id: string,
    description: string,
  }
}

export class ContigDef extends jspb.Message {
  getId(): string;
  setId(value: string): void;

  getLength(): number;
  setLength(value: number): void;

  getHasLength(): boolean;
  setHasLength(value: boolean): void;

  getAssembly(): string;
  setAssembly(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContigDef.AsObject;
  static toObject(includeInstance: boolean, msg: ContigDef): ContigDef.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ContigDef, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContigDef;
  static deserializeBinaryFromReader(message: ContigDef, reader: jspb.BinaryReader): ContigDef;
}

export namespace ContigDef {
  export type AsObject = {
    id: string,
    length: number,
    hasLength: boolean,
    assembly: string,
  }
}

export class HeaderInfo extends jspb.Message {
  getFileformat(): string;
  setFileformat(value: string): void;

  clearInfoFieldsList(): void;
  getInfoFieldsList(): Array<FieldDef>;
  setInfoFieldsList(value: Array<FieldDef>): void;
  addInfoFields(value?: FieldDef, index?: number): FieldDef;

  clearFormatFieldsList(): void;
  getFormatFieldsList(): Array<FieldDef>;
  setFormatFieldsList(value: Array<FieldDef>): void;
  addFormatFields(value?: FieldDef, index?: number): FieldDef;

  clearFiltersList(): void;
  getFiltersList(): Array<FilterDef>;
  setFiltersList(value: Array<FilterDef>): void;
  addFilters(value?: FilterDef, index?: number): FilterDef;

  clearContigsList(): void;
  getContigsList(): Array<ContigDef>;
  setContigsList(value: Array<ContigDef>): void;
  addContigs(value?: ContigDef, index?: number): ContigDef;

  clearSampleNamesList(): void;
  getSampleNamesList(): Array<string>;
  setSampleNamesList(value: Array<string>): void;
  addSampleNames(value: string, index?: number): string;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HeaderInfo.AsObject;
  static toObject(includeInstance: boolean, msg: HeaderInfo): HeaderInfo.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: HeaderInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HeaderInfo;
  static deserializeBinaryFromReader(message: HeaderInfo, reader: jspb.BinaryReader): HeaderInfo;
}

export namespace HeaderInfo {
  export type AsObject = {
    fileformat: string,
    infoFieldsList: Array<FieldDef.AsObject>,
    formatFieldsList: Array<FieldDef.AsObject>,
    filtersList: Array<FilterDef.AsObject>,
    contigsList: Array<ContigDef.AsObject>,
    sampleNamesList: Array<string>,
    error?: Error.AsObject,
  }
}

export class TypedValues extends jspb.Message {
  getType(): string;
  setType(value: string): void;

  clearIntValuesList(): void;
  getIntValuesList(): Array<number>;
  setIntValuesList(value: Array<number>): void;
  addIntValues(value: number, index?: number): number;

  clearFloatValuesList(): void;
  getFloatValuesList(): Array<number>;
  setFloatValuesList(value: Array<number>): void;
  addFloatValues(value: number, index?: number): number;

  clearStringValuesList(): void;
  getStringValuesList(): Array<string>;
  setStringValuesList(value: Array<string>): void;
  addStringValues(value: string, index?: number): string;

  getPresent(): boolean;
  setPresent(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TypedValues.AsObject;
  static toObject(includeInstance: boolean, msg: TypedValues): TypedValues.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TypedValues, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TypedValues;
  static deserializeBinaryFromReader(message: TypedValues, reader: jspb.BinaryReader): TypedValues;
}

export namespace TypedValues {
  export type AsObject = {
    type: string,
    intValuesList: Array<number>,
    floatValuesList: Array<number>,
    stringValuesList: Array<string>,
    present: boolean,
  }
}

export class Variant extends jspb.Message {
  getChrom(): string;
  setChrom(value: string): void;

  getPos(): number;
  setPos(value: number): void;

  clearIdList(): void;
  getIdList(): Array<string>;
  setIdList(value: Array<string>): void;
  addId(value: string, index?: number): string;

  getRef(): string;
  setRef(value: string): void;

  clearAltList(): void;
  getAltList(): Array<string>;
  setAltList(value: Array<string>): void;
  addAlt(value: string, index?: number): string;

  getQual(): number;
  setQual(value: number): void;

  getHasQual(): boolean;
  setHasQual(value: boolean): void;

  clearFilterList(): void;
  getFilterList(): Array<string>;
  setFilterList(value: Array<string>): void;
  addFilter(value: string, index?: number): string;

  getInfoMap(): jspb.Map<string, TypedValues>;
  clearInfoMap(): void;
  getFormat(): string;
  setFormat(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Variant.AsObject;
  static toObject(includeInstance: boolean, msg: Variant): Variant.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Variant, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Variant;
  static deserializeBinaryFromReader(message: Variant, reader: jspb.BinaryReader): Variant;
}

export namespace Variant {
  export type AsObject = {
    chrom: string,
    pos: number,
    idList: Array<string>,
    ref: string,
    altList: Array<string>,
    qual: number,
    hasQual: boolean,
    filterList: Array<string>,
    infoMap: Array<[string, TypedValues.AsObject]>,
    format: string,
  }
}

export class ListVariantsInput extends jspb.Message {
  getVcfText(): string;
  setVcfText(value: string): void;

  getMaxVariants(): number;
  setMaxVariants(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListVariantsInput.AsObject;
  static toObject(includeInstance: boolean, msg: ListVariantsInput): ListVariantsInput.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ListVariantsInput, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListVariantsInput;
  static deserializeBinaryFromReader(message: ListVariantsInput, reader: jspb.BinaryReader): ListVariantsInput;
}

export namespace ListVariantsInput {
  export type AsObject = {
    vcfText: string,
    maxVariants: number,
  }
}

export class VariantList extends jspb.Message {
  clearVariantsList(): void;
  getVariantsList(): Array<Variant>;
  setVariantsList(value: Array<Variant>): void;
  addVariants(value?: Variant, index?: number): Variant;

  getTotalCount(): number;
  setTotalCount(value: number): void;

  getTruncated(): boolean;
  setTruncated(value: boolean): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): VariantList.AsObject;
  static toObject(includeInstance: boolean, msg: VariantList): VariantList.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: VariantList, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): VariantList;
  static deserializeBinaryFromReader(message: VariantList, reader: jspb.BinaryReader): VariantList;
}

export namespace VariantList {
  export type AsObject = {
    variantsList: Array<Variant.AsObject>,
    totalCount: number,
    truncated: boolean,
    error?: Error.AsObject,
  }
}

export class GetVariantInput extends jspb.Message {
  getVcfText(): string;
  setVcfText(value: string): void;

  getChrom(): string;
  setChrom(value: string): void;

  getPos(): number;
  setPos(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetVariantInput.AsObject;
  static toObject(includeInstance: boolean, msg: GetVariantInput): GetVariantInput.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GetVariantInput, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetVariantInput;
  static deserializeBinaryFromReader(message: GetVariantInput, reader: jspb.BinaryReader): GetVariantInput;
}

export namespace GetVariantInput {
  export type AsObject = {
    vcfText: string,
    chrom: string,
    pos: number,
  }
}

export class VariantResult extends jspb.Message {
  hasVariant(): boolean;
  clearVariant(): void;
  getVariant(): Variant | undefined;
  setVariant(value?: Variant): void;

  getFound(): boolean;
  setFound(value: boolean): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): VariantResult.AsObject;
  static toObject(includeInstance: boolean, msg: VariantResult): VariantResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: VariantResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): VariantResult;
  static deserializeBinaryFromReader(message: VariantResult, reader: jspb.BinaryReader): VariantResult;
}

export namespace VariantResult {
  export type AsObject = {
    variant?: Variant.AsObject,
    found: boolean,
    error?: Error.AsObject,
  }
}

export class VariantInfoResult extends jspb.Message {
  getChrom(): string;
  setChrom(value: string): void;

  getPos(): number;
  setPos(value: number): void;

  getInfoMap(): jspb.Map<string, TypedValues>;
  clearInfoMap(): void;
  getFound(): boolean;
  setFound(value: boolean): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): VariantInfoResult.AsObject;
  static toObject(includeInstance: boolean, msg: VariantInfoResult): VariantInfoResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: VariantInfoResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): VariantInfoResult;
  static deserializeBinaryFromReader(message: VariantInfoResult, reader: jspb.BinaryReader): VariantInfoResult;
}

export namespace VariantInfoResult {
  export type AsObject = {
    chrom: string,
    pos: number,
    infoMap: Array<[string, TypedValues.AsObject]>,
    found: boolean,
    error?: Error.AsObject,
  }
}

export class SampleGenotype extends jspb.Message {
  getSample(): string;
  setSample(value: string): void;

  getGtRaw(): string;
  setGtRaw(value: string): void;

  getHasGt(): boolean;
  setHasGt(value: boolean): void;

  getPhased(): boolean;
  setPhased(value: boolean): void;

  clearAlleleIndicesList(): void;
  getAlleleIndicesList(): Array<number>;
  setAlleleIndicesList(value: Array<number>): void;
  addAlleleIndices(value: number, index?: number): number;

  getZygosity(): string;
  setZygosity(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SampleGenotype.AsObject;
  static toObject(includeInstance: boolean, msg: SampleGenotype): SampleGenotype.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SampleGenotype, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SampleGenotype;
  static deserializeBinaryFromReader(message: SampleGenotype, reader: jspb.BinaryReader): SampleGenotype;
}

export namespace SampleGenotype {
  export type AsObject = {
    sample: string,
    gtRaw: string,
    hasGt: boolean,
    phased: boolean,
    alleleIndicesList: Array<number>,
    zygosity: string,
  }
}

export class GenotypesResult extends jspb.Message {
  getChrom(): string;
  setChrom(value: string): void;

  getPos(): number;
  setPos(value: number): void;

  clearGenotypesList(): void;
  getGenotypesList(): Array<SampleGenotype>;
  setGenotypesList(value: Array<SampleGenotype>): void;
  addGenotypes(value?: SampleGenotype, index?: number): SampleGenotype;

  getFound(): boolean;
  setFound(value: boolean): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GenotypesResult.AsObject;
  static toObject(includeInstance: boolean, msg: GenotypesResult): GenotypesResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GenotypesResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GenotypesResult;
  static deserializeBinaryFromReader(message: GenotypesResult, reader: jspb.BinaryReader): GenotypesResult;
}

export namespace GenotypesResult {
  export type AsObject = {
    chrom: string,
    pos: number,
    genotypesList: Array<SampleGenotype.AsObject>,
    found: boolean,
    error?: Error.AsObject,
  }
}

export class SampleFields extends jspb.Message {
  getSample(): string;
  setSample(value: string): void;

  getFieldsMap(): jspb.Map<string, TypedValues>;
  clearFieldsMap(): void;
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SampleFields.AsObject;
  static toObject(includeInstance: boolean, msg: SampleFields): SampleFields.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SampleFields, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SampleFields;
  static deserializeBinaryFromReader(message: SampleFields, reader: jspb.BinaryReader): SampleFields;
}

export namespace SampleFields {
  export type AsObject = {
    sample: string,
    fieldsMap: Array<[string, TypedValues.AsObject]>,
  }
}

export class SampleFieldsResult extends jspb.Message {
  getChrom(): string;
  setChrom(value: string): void;

  getPos(): number;
  setPos(value: number): void;

  clearSamplesList(): void;
  getSamplesList(): Array<SampleFields>;
  setSamplesList(value: Array<SampleFields>): void;
  addSamples(value?: SampleFields, index?: number): SampleFields;

  getFound(): boolean;
  setFound(value: boolean): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SampleFieldsResult.AsObject;
  static toObject(includeInstance: boolean, msg: SampleFieldsResult): SampleFieldsResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SampleFieldsResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SampleFieldsResult;
  static deserializeBinaryFromReader(message: SampleFieldsResult, reader: jspb.BinaryReader): SampleFieldsResult;
}

export namespace SampleFieldsResult {
  export type AsObject = {
    chrom: string,
    pos: number,
    samplesList: Array<SampleFields.AsObject>,
    found: boolean,
    error?: Error.AsObject,
  }
}

export class SampleList extends jspb.Message {
  clearSampleNamesList(): void;
  getSampleNamesList(): Array<string>;
  setSampleNamesList(value: Array<string>): void;
  addSampleNames(value: string, index?: number): string;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SampleList.AsObject;
  static toObject(includeInstance: boolean, msg: SampleList): SampleList.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: SampleList, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SampleList;
  static deserializeBinaryFromReader(message: SampleList, reader: jspb.BinaryReader): SampleList;
}

export namespace SampleList {
  export type AsObject = {
    sampleNamesList: Array<string>,
    error?: Error.AsObject,
  }
}

export class VariantTypeEntry extends jspb.Message {
  getChrom(): string;
  setChrom(value: string): void;

  getPos(): number;
  setPos(value: number): void;

  getRef(): string;
  setRef(value: string): void;

  clearAltList(): void;
  getAltList(): Array<string>;
  setAltList(value: Array<string>): void;
  addAlt(value: string, index?: number): string;

  clearAlleleTypesList(): void;
  getAlleleTypesList(): Array<string>;
  setAlleleTypesList(value: Array<string>): void;
  addAlleleTypes(value: string, index?: number): string;

  getVariantType(): string;
  setVariantType(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): VariantTypeEntry.AsObject;
  static toObject(includeInstance: boolean, msg: VariantTypeEntry): VariantTypeEntry.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: VariantTypeEntry, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): VariantTypeEntry;
  static deserializeBinaryFromReader(message: VariantTypeEntry, reader: jspb.BinaryReader): VariantTypeEntry;
}

export namespace VariantTypeEntry {
  export type AsObject = {
    chrom: string,
    pos: number,
    ref: string,
    altList: Array<string>,
    alleleTypesList: Array<string>,
    variantType: string,
  }
}

export class VariantTypeList extends jspb.Message {
  clearTypesList(): void;
  getTypesList(): Array<VariantTypeEntry>;
  setTypesList(value: Array<VariantTypeEntry>): void;
  addTypes(value?: VariantTypeEntry, index?: number): VariantTypeEntry;

  getTotalCount(): number;
  setTotalCount(value: number): void;

  getTruncated(): boolean;
  setTruncated(value: boolean): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): VariantTypeList.AsObject;
  static toObject(includeInstance: boolean, msg: VariantTypeList): VariantTypeList.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: VariantTypeList, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): VariantTypeList;
  static deserializeBinaryFromReader(message: VariantTypeList, reader: jspb.BinaryReader): VariantTypeList;
}

export namespace VariantTypeList {
  export type AsObject = {
    typesList: Array<VariantTypeEntry.AsObject>,
    totalCount: number,
    truncated: boolean,
    error?: Error.AsObject,
  }
}

export class FilterByStatusInput extends jspb.Message {
  getVcfText(): string;
  setVcfText(value: string): void;

  clearStatusesList(): void;
  getStatusesList(): Array<string>;
  setStatusesList(value: Array<string>): void;
  addStatuses(value: string, index?: number): string;

  getMaxVariants(): number;
  setMaxVariants(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FilterByStatusInput.AsObject;
  static toObject(includeInstance: boolean, msg: FilterByStatusInput): FilterByStatusInput.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FilterByStatusInput, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FilterByStatusInput;
  static deserializeBinaryFromReader(message: FilterByStatusInput, reader: jspb.BinaryReader): FilterByStatusInput;
}

export namespace FilterByStatusInput {
  export type AsObject = {
    vcfText: string,
    statusesList: Array<string>,
    maxVariants: number,
  }
}

export class FilterByRegionInput extends jspb.Message {
  getVcfText(): string;
  setVcfText(value: string): void;

  getChrom(): string;
  setChrom(value: string): void;

  getStart(): number;
  setStart(value: number): void;

  getEnd(): number;
  setEnd(value: number): void;

  getHasStart(): boolean;
  setHasStart(value: boolean): void;

  getHasEnd(): boolean;
  setHasEnd(value: boolean): void;

  getMaxVariants(): number;
  setMaxVariants(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FilterByRegionInput.AsObject;
  static toObject(includeInstance: boolean, msg: FilterByRegionInput): FilterByRegionInput.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FilterByRegionInput, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FilterByRegionInput;
  static deserializeBinaryFromReader(message: FilterByRegionInput, reader: jspb.BinaryReader): FilterByRegionInput;
}

export namespace FilterByRegionInput {
  export type AsObject = {
    vcfText: string,
    chrom: string,
    start: number,
    end: number,
    hasStart: boolean,
    hasEnd: boolean,
    maxVariants: number,
  }
}

export class FilterByInfoInput extends jspb.Message {
  getVcfText(): string;
  setVcfText(value: string): void;

  getInfoKey(): string;
  setInfoKey(value: string): void;

  getOp(): string;
  setOp(value: string): void;

  getThreshold(): number;
  setThreshold(value: number): void;

  getMaxVariants(): number;
  setMaxVariants(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FilterByInfoInput.AsObject;
  static toObject(includeInstance: boolean, msg: FilterByInfoInput): FilterByInfoInput.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FilterByInfoInput, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FilterByInfoInput;
  static deserializeBinaryFromReader(message: FilterByInfoInput, reader: jspb.BinaryReader): FilterByInfoInput;
}

export namespace FilterByInfoInput {
  export type AsObject = {
    vcfText: string,
    infoKey: string,
    op: string,
    threshold: number,
    maxVariants: number,
  }
}

export class VariantCounts extends jspb.Message {
  getTotal(): number;
  setTotal(value: number): void;

  getByTypeMap(): jspb.Map<string, number>;
  clearByTypeMap(): void;
  getByChromosomeMap(): jspb.Map<string, number>;
  clearByChromosomeMap(): void;
  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): VariantCounts.AsObject;
  static toObject(includeInstance: boolean, msg: VariantCounts): VariantCounts.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: VariantCounts, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): VariantCounts;
  static deserializeBinaryFromReader(message: VariantCounts, reader: jspb.BinaryReader): VariantCounts;
}

export namespace VariantCounts {
  export type AsObject = {
    total: number,
    byTypeMap: Array<[string, number]>,
    byChromosomeMap: Array<[string, number]>,
    error?: Error.AsObject,
  }
}

export class ChromPositionsInput extends jspb.Message {
  getVcfText(): string;
  setVcfText(value: string): void;

  getChrom(): string;
  setChrom(value: string): void;

  getMaxPositions(): number;
  setMaxPositions(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChromPositionsInput.AsObject;
  static toObject(includeInstance: boolean, msg: ChromPositionsInput): ChromPositionsInput.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChromPositionsInput, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChromPositionsInput;
  static deserializeBinaryFromReader(message: ChromPositionsInput, reader: jspb.BinaryReader): ChromPositionsInput;
}

export namespace ChromPositionsInput {
  export type AsObject = {
    vcfText: string,
    chrom: string,
    maxPositions: number,
  }
}

export class ChromPositions extends jspb.Message {
  getChrom(): string;
  setChrom(value: string): void;

  clearPositionsList(): void;
  getPositionsList(): Array<number>;
  setPositionsList(value: Array<number>): void;
  addPositions(value: number, index?: number): number;

  getTotalCount(): number;
  setTotalCount(value: number): void;

  getTruncated(): boolean;
  setTruncated(value: boolean): void;

  hasError(): boolean;
  clearError(): void;
  getError(): Error | undefined;
  setError(value?: Error): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChromPositions.AsObject;
  static toObject(includeInstance: boolean, msg: ChromPositions): ChromPositions.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ChromPositions, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChromPositions;
  static deserializeBinaryFromReader(message: ChromPositions, reader: jspb.BinaryReader): ChromPositions;
}

export namespace ChromPositions {
  export type AsObject = {
    chrom: string,
    positionsList: Array<number>,
    totalCount: number,
    truncated: boolean,
    error?: Error.AsObject,
  }
}

export class ValidationIssue extends jspb.Message {
  getLineNumber(): number;
  setLineNumber(value: number): void;

  getSeverity(): string;
  setSeverity(value: string): void;

  getCode(): string;
  setCode(value: string): void;

  getMessage(): string;
  setMessage(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ValidationIssue.AsObject;
  static toObject(includeInstance: boolean, msg: ValidationIssue): ValidationIssue.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ValidationIssue, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ValidationIssue;
  static deserializeBinaryFromReader(message: ValidationIssue, reader: jspb.BinaryReader): ValidationIssue;
}

export namespace ValidationIssue {
  export type AsObject = {
    lineNumber: number,
    severity: string,
    code: string,
    message: string,
  }
}

export class ValidationResult extends jspb.Message {
  getValid(): boolean;
  setValid(value: boolean): void;

  clearIssuesList(): void;
  getIssuesList(): Array<ValidationIssue>;
  setIssuesList(value: Array<ValidationIssue>): void;
  addIssues(value?: ValidationIssue, index?: number): ValidationIssue;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ValidationResult.AsObject;
  static toObject(includeInstance: boolean, msg: ValidationResult): ValidationResult.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: ValidationResult, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ValidationResult;
  static deserializeBinaryFromReader(message: ValidationResult, reader: jspb.BinaryReader): ValidationResult;
}

export namespace ValidationResult {
  export type AsObject = {
    valid: boolean,
    issuesList: Array<ValidationIssue.AsObject>,
  }
}

