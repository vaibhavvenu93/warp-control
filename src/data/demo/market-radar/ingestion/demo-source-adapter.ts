import type {
  ExternalSourceAdapter,
  ExternalSourceDefinition,
  RawObservation,
  SourceAdapterContext,
} from "@/domain/market-radar/ingestion/observation-types";

import {
  createExternalSource,
} from "@/domain/market-radar/ingestion/source-registry";

export const INGESTION_DEMO_NOW =
  "2026-09-23T12:00:00.000Z";

export const demoWarpBuildPublicSource =
  createExternalSource({
    id:
      "external-source-warpbuild-public-demo",

    name:
      "WarpBuild Public Surface — Demo Adapter",

    kind:
      "WEBSITE",

    sourceType:
      "PUBLIC_WEB",

    provenance:
      "PUBLIC",

    uri:
      "https://warpbuild.com",

    description:
      "Deterministic adapter used to exercise the public-source ingestion architecture. It does not perform a live network request.",

    trustScore:
      0.85,

    enabled:
      true,

    pollingEligible:
      true,

    tags: [
      "warpbuild",
      "public",
      "demo-adapter",
    ],

    metadata: {
      mode:
        "DETERMINISTIC_DEMO",

      networkRequest:
        false,
    },
  });

const DEMO_OBSERVATIONS:
  RawObservation[] = [
    {
      externalId:
        "warpbuild-public-demo-001",

      sourceId:
        demoWarpBuildPublicSource.id,

      sourceName:
        demoWarpBuildPublicSource.name,

      sourceUri:
        "https://warpbuild.com",

      canonicalUri:
        "https://warpbuild.com/?utm_source=demo",

      title:
        "WarpBuild CI positioning",

      body:
        "WarpBuild is represented in the WARP / CONTROL demo corpus as infrastructure focused on accelerating CI workflows.",

      observedAt:
        "2026-09-23T10:00:00.000Z",

      publishedAt:
        "2026-09-23T10:00:00.000Z",

      categories: [
        "CI_INFRASTRUCTURE",
        "PRODUCT",
      ],

      entities: [
        {
          name:
            "WarpBuild",
          type:
            "COMPANY",
        },
        {
          name:
            "WarpBuild CI",
          type:
            "PRODUCT",
        },
      ],

      metadata: {
        syntheticContent:
          true,

        purpose:
          "PIPELINE_VALIDATION",

        factStatus:
          "DEMO_FIXTURE",
      },
    },

    {
      externalId:
        "warpbuild-public-demo-002",

      sourceId:
        demoWarpBuildPublicSource.id,

      sourceName:
        demoWarpBuildPublicSource.name,

      sourceUri:
        "https://warpbuild.com/demo-ci",

      canonicalUri:
        "https://warpbuild.com/demo-ci",

      title:
        "CI feedback loop demo observation",

      body:
        "This deterministic fixture represents a second external observation so ingestion, freshness, entities and provenance can be tested independently from signal scoring.",

      observedAt:
        "2026-09-22T12:00:00.000Z",

      publishedAt:
        "2026-09-22T12:00:00.000Z",

      categories: [
        "CI_INFRASTRUCTURE",
        "DEVELOPER_ECOSYSTEM",
      ],

      entities: [
        {
          name:
            "CI",
          type:
            "TECHNOLOGY",
        },
        {
          name:
            "Developer feedback loops",
          type:
            "CONCEPT",
        },
      ],

      metadata: {
        syntheticContent:
          true,

        purpose:
          "PIPELINE_VALIDATION",

        factStatus:
          "DEMO_FIXTURE",
      },
    },
  ];

export class DemoWarpBuildPublicAdapter
  implements
    ExternalSourceAdapter {
  readonly source =
    demoWarpBuildPublicSource;

  async fetch(
    _context:
      SourceAdapterContext,
  ): Promise<
    RawObservation[]
  > {
    return DEMO_OBSERVATIONS.map(
      (observation) => ({
        ...observation,

        categories: [
          ...observation.categories,
        ],

        entities:
          observation.entities.map(
            (entity) => ({
              ...entity,
            }),
          ),

        metadata: {
          ...observation.metadata,
        },
      }),
    );
  }
}