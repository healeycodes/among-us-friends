import React from 'react'

import { color } from '@data-ui/theme'

import {
    Sparkline,
    LineSeries,
    PointSeries,
    VerticalReferenceLine,
    WithTooltip,
    PatternLines,
    BandLine,
} from '@data-ui/sparkline'

PatternLines.displayName = 'PatternLines'

const sparklineProps = {
    ariaLabel: 'This is a Sparkline of...',
    width: 500,
    height: 100,
    margin: { top: 24, right: 64, bottom: 24, left: 64 },
    valueAccessor: d => d.y,
}

const renderLabel = d => d.toFixed(2)

const renderTooltip = (
    { datum },
) => (
    <div>
        <b>{datum.y ? datum.y.toFixed(2) : '--'}</b>
    </div>
)

export default function Graph (props) {
    return <>
        {(data => (
            <>
                <WithTooltip renderTooltip={renderTooltip}>
                    {({ onMouseMove, onMouseLeave, tooltipData }) => (
                        <Sparkline
                            {...sparklineProps}
                            onMouseLeave={onMouseLeave}
                            onMouseMove={onMouseMove}
                            data={data}
                        >
                            <PatternLines
                                id="band_pattern_hash"
                                height={7}
                                width={7}
                                stroke={color.grays[5]}
                                strokeWidth={1}
                                orientation={['vertical', 'horizontal']}
                            />
                            <BandLine
                                fill="url(#band_pattern_hash)"
                                stroke={color.grays[5]}
                                band={{ from: {}, to: {} }}
                            />
                            <LineSeries stroke={color.grays[7]} />
                            <PointSeries
                                points={['last']}
                                fill={color.grays[5]}
                                size={5}
                                stroke="#fff"
                                renderLabel={renderLabel}
                            />
                            {tooltipData && [
                                <VerticalReferenceLine
                                    key="ref-line"
                                    strokeWidth={1}
                                    reference={tooltipData.index}
                                    strokeDasharray="4 4"
                                />,
                                <PointSeries
                                    key="ref-point"
                                    points={[tooltipData.index]}
                                    fill={color.grays[8]}
                                />,
                            ]}
                        </Sparkline>
                    )}
                </WithTooltip>
            </>
        ))(props.data)}
    </>
}
