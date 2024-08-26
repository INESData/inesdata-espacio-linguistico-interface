import { type RouteLocation } from 'vue-router';
type RoutePropsFunction = (route: RouteLocation) => object;

/**
 * Creates a props-function for Vue-Router to pass all route parameters and query parameters as
 * props to the routed component.
 * You may filter the passed query parameters by name so that only the expected
 * props will be bound.
 * @param queryFilter List of query parameters which will be passed as props to the component.
 * This is optional. If not set all query parameters will be bound.
 */
export default function (queryFilter?: string[]): RoutePropsFunction {
  return function (route: RouteLocation) {
    const filtered = queryFilter
      ? queryFilter.reduce((a, b) => ({ ...a, [b]: route.query[b] }), {})
      : route.query;
    return { ...route.params, ...filtered };
  };
}
