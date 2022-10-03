import React from 'react';

export type State =
  | { state: 'idle' }
  | { state: 'validating' }
  | {
      state: 'valid';
    }
  | {
      state: 'invalid';
      error: string;
    };

export const useValidateName = (
  owner: string = '',
  name: string = ''
): State => {
  const [validation, setValidation] = React.useState<State>({
    state: 'idle',
  });

  const fullName = owner && name ? `${owner}/${name}` : '';
//   const debouncedSearchTerm = useDebounce(fullName, 500);

  React.useEffect(
    () => {
      if (!fullName) {
        setValidation({ state: 'idle' });
        return;
      }

      async function validateName() {
        setValidation({ state: 'validating' });

        try {
          const response = await fetch(
            `/api/beta/repos/validate/github/${fullName}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('devJwt')}`,
              },
            }
          );

          if (response.ok) {
            setValidation({ state: 'valid' });
          } else {
            setValidation({
              state: 'invalid',
              error: await response.text(),
            });
          }
        } catch (e) {
          setValidation({
            state: 'invalid',
            error: 'Something went wrong',
          });
        }
      }

      validateName();
    },
    [fullName]
  );

  return validation;
};
