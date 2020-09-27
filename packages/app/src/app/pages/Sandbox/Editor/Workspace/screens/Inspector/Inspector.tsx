import React, { useEffect } from 'react';
import { Collapsible, Stack, Text } from '@codesandbox/components';

import {
  getInspectorStateService,
  EditorInspectorState,
} from 'inspector/lib/editor';
import {
  Fiber as FiberType,
  StaticComponentInformation,
} from 'inspector/lib/common/fibers';

import { useOvermind } from 'app/overmind';
import { resolveModule } from '@codesandbox/common/lib/sandbox/modules';
import { Fiber } from './Fiber';
import { BaseKnob } from './Knobs';

export const Inspector = () => {
  const { actions, effects, state } = useOvermind();
  const inspectorStateService = React.useRef<EditorInspectorState>();
  const [fibers, setFibers] = React.useState<FiberType[]>([]);
  const [selectedFiber, setSelectedFiber] = React.useState<FiberType | null>(
    null
  );
  const [
    componentInformation,
    setComponentInformation,
  ] = React.useState<StaticComponentInformation | null>(null);

  useEffect(() => {
    const inspector = getInspectorStateService();
    inspectorStateService.current = inspector;
    inspector.getFibers().then(editorFibers => {
      setFibers(editorFibers);
    });
    inspector.onSelectionChanged(fiber => {
      setSelectedFiber(fiber);

      actions.editor.moduleSelected({ path: fiber.location.path }).then(() => {
        effects.vscode.setSelectionFromRange({
          startLineNumber: fiber.location.codePosition.startLineNumber,
          endLineNumber: fiber.location.codePosition.endLineNumber,
          startColumn: fiber.location.codePosition.startColumnNumber,
          endColumn: fiber.location.codePosition.endColumnNumber,
        });
      });

      inspector.getFiberComponentInformation(fiber.id).then(info => {
        setComponentInformation(info);
      });
    });
  }, []);

  return (
    <>
      <Collapsible defaultOpen title="App Structure">
        <div style={{ marginTop: -16 }}>
          {fibers.map(fiber => (
            <Fiber
              key={fiber.id}
              id={fiber.id}
              name={fiber.name || 'Anonymous'}
              depth={fiber.depth}
              selected={selectedFiber?.id === fiber.id}
              onSelect={id => {
                inspectorStateService.current.selectFiber(id);
              }}
              onMouseEnter={id => {
                inspectorStateService.current.highlightFiber(id);

                effects.vscode.highlightRange(
                  fiber.location.path,
                  {
                    startLineNumber:
                      fiber.location.codePosition.startLineNumber,
                    endLineNumber: fiber.location.codePosition.endLineNumber,
                    startColumn: fiber.location.codePosition.startColumnNumber,
                    endColumn: fiber.location.codePosition.endColumnNumber,
                  },
                  '#6CC7F650',
                  'inspector'
                );
              }}
              onMouseLeave={id => {
                inspectorStateService.current.stopHighlightFiber(id);

                effects.vscode.clearHighlightedRange(
                  fiber.location.path,
                  'inspector'
                );
              }}
            />
          ))}
        </div>
      </Collapsible>
      <Collapsible defaultOpen title="Knobs">
        {selectedFiber && (
          <Stack
            gap={2}
            direction="vertical"
            padding={3}
            style={{ marginTop: -16 }}
          >
            <Text weight="bold" color="white">
              {selectedFiber.name || 'Anonymous'}
            </Text>

            {componentInformation?.props.map(val => <BaseKnob key={val.name} label={val.name} />)}
          </Stack>
        )}
      </Collapsible>
    </>
  );
};
