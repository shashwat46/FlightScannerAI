import React from 'react';

type Registry = Record<string, React.ComponentType<any>>;

export interface RenderNode {
  type: string;
  props?: Record<string, any>;
  bind?: string;
  expanded?: boolean;
}

export interface SchemaRendererProps {
  layout: RenderNode[];
  registry: Registry;
  data?: Record<string, any>;
}

export function SchemaRenderer({ layout, registry, data }: SchemaRendererProps) {
  return (
    <>
      {layout.map((node, idx) => {
        const Cmp = registry[node.type];
        if (!Cmp) return null;
        const bound = node.bind ? getByPath(data || {}, node.bind) : undefined;
        const mergedProps = { ...(node.props || {}), ...(typeof bound === 'object' ? bound : {}), _bound: bound };
        return <Cmp key={idx} {...mergedProps} expanded={node.expanded} />;
      })}
    </>
  );
}

function getByPath(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}


